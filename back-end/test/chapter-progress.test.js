"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { randomBytes } = require("node:crypto");
const { expect } = require("chai");
const request = require("supertest");
const { createApp } = require("../src/app");
const { connectDatabase } = require("../src/database");
const { readConfig } = require("../src/config");
const { dummyPasswordHash, issueSession } = require("../src/security");
const { ensurePlayerProfile, applyProfileUnlocks } = require("../src/services/playerProfiles");
const { applyItemReward } = require("../src/services/inventory");
const { getChapter } = require("../src/data/chapters");
const { getStoryFact } = require("../src/data/storyFacts");

const chapterId = "ancient-gold-coin";
const chapter = getChapter(chapterId);
const progressPath = `/api/game/chapters/${chapterId}/progress`;
const completePath = `/api/game/chapters/${chapterId}/complete`;
const emptyProgress = { chapterId, entryId: null, furthestEntryId: null, completedAt: null };

describe("Chapter content references", () => {
  it("keeps explicit numeric IDs in the same reading order as the bundled story", function () {
    const storyPath = path.join(__dirname, "../../front-end/src/content/story/ancient-gold-coin.js");
    // A separately deployed back-end does not contain front-end source files.
    if (!fs.existsSync(storyPath)) return this.skip();
    const source = fs.readFileSync(storyPath, "utf8");
    const ids = [...source.matchAll(/\bid:\s*(\d+)\s*,/g)].map((match) => Number(match[1]));
    expect(ids).to.deep.equal(chapter.entryIds);
    expect(new Set(ids).size).to.equal(ids.length);
    expect(ids.every((id) => Number.isSafeInteger(id) && id > 0)).to.equal(true);
    expect(chapter.characterUnlocks).to.deep.equal([
      { entryId: 1002, characterId: "ivan" }, { entryId: 1003, characterId: "ona" },
    ]);
  });

  it("unlocks each fact only after its source entries, or at chapter completion", () => {
    expect(chapter.characterUnlocks.every((event) => chapter.entryIds.includes(event.entryId))).to.equal(true);
    for (const factId of chapter.factIds) {
      const fact = getStoryFact(factId);
      expect(fact.chapterId).to.equal(chapterId);
      expect(fact.sourceEntryIds.every((id) => chapter.entryIds.includes(id))).to.equal(true);
      if (!fact.completionOnly) {
        const triggerIndex = chapter.entryIds.indexOf(fact.unlockEntryId);
        expect(triggerIndex).to.be.at.least(0);
        expect(fact.sourceEntryIds.every((id) => chapter.entryIds.indexOf(id) <= triggerIndex)).to.equal(true);
      }
    }
  });
});

describe("Chapter reward and unlock helpers", () => {
  const firstDate = new Date("2026-01-01T00:00:00Z");
  const laterDate = new Date("2026-02-01T00:00:00Z");

  it("awards a coin once, merges an existing stack, and preserves the first claim date", () => {
    for (const initialCount of [0, 2]) {
      const profile = {
        inventory: initialCount ? [{ itemId: "ancient-coin", count: initialCount, acquiredAt: firstDate }] : [],
        rewardClaims: [],
      };
      expect(applyItemReward(profile, "chapter-ancient-gold-coin", chapter.rewards, firstDate))
        .to.deep.equal([{ itemId: "ancient-coin", count: 1 }]);
      expect(applyItemReward(profile, "chapter-ancient-gold-coin", chapter.rewards, laterDate)).to.deep.equal([]);
      expect(profile.inventory).to.deep.equal([{ itemId: "ancient-coin", count: initialCount + 1, acquiredAt: firstDate }]);
      expect(profile.rewardClaims).to.deep.equal([{ rewardId: "chapter-ancient-gold-coin", claimedAt: firstDate }]);
    }
  });

  it("rejects unknown items, invalid quantities, and overflowing stacks without recording a claim", () => {
    for (const [inventory, rewards] of [
      [[], [{ itemId: "unknown", count: 1 }]],
      [[], [{ itemId: "ancient-coin", count: 0 }]],
      [[{ itemId: "ancient-coin", count: Number.MAX_SAFE_INTEGER, acquiredAt: firstDate }], chapter.rewards],
    ]) {
      const profile = { inventory, rewardClaims: [] };
      const before = structuredClone(profile);
      expect(() => applyItemReward(profile, "chapter-ancient-gold-coin", rewards)).to.throw(Error);
      expect(profile).to.deep.equal(before);
    }
  });

  it("keeps existing unlock dates and relationships, deduplicates retries, and rejects invalid grants", () => {
    const firstFact = "ancient-gold-coin-first-assignment";
    const secondFact = "ancient-gold-coin-ore";
    const profile = {
      characterProgress: [{ characterId: "ona", unlockedAt: firstDate, relationshipTier: "more_open" }],
      storyUnlocks: [{ factId: firstFact, unlockedAt: firstDate }],
    };
    const grants = { characterIds: ["ona", "ivan", "ivan"], factIds: [firstFact, secondFact, secondFact] };
    applyProfileUnlocks(profile, grants, laterDate);
    const granted = structuredClone(profile);
    applyProfileUnlocks(profile, grants, new Date("2026-03-01T00:00:00Z"));
    expect(profile).to.deep.equal(granted);
    expect(profile.characterProgress).to.deep.equal([
      { characterId: "ona", unlockedAt: firstDate, relationshipTier: "more_open" },
      { characterId: "ivan", unlockedAt: laterDate, relationshipTier: "reserved" },
    ]);
    expect(profile.storyUnlocks).to.deep.equal([
      { factId: firstFact, unlockedAt: firstDate }, { factId: secondFact, unlockedAt: laterDate },
    ]);
    expect(() => applyProfileUnlocks(profile, { characterIds: ["cislo"], factIds: ["unknown"] })).to.throw(Error);
    expect(profile).to.deep.equal(granted);
  });
});

describe("MongoDB chapter progress and rewards", function () {
  let database, models, config, app;
  const dbName = `abf_chapter_test_${randomBytes(8).toString("hex")}`;
  const logger = { error() {} };

  before(async function () {
    if (!process.env.TEST_MONGODB_URI) return this.skip();
    config = readConfig({ MONGODB_URI: process.env.TEST_MONGODB_URI, MONGODB_DB_NAME: dbName, JWT_SECRET: "c".repeat(64) });
    database = await connectDatabase(config);
    models = database.models;
    app = createApp({ config, models, logger });
  });

  afterEach(async () => {
    if (models) await Promise.all(Object.values(models).map((model) => model.deleteMany({})));
  });

  after(async () => {
    if (!database) return;
    try {
      expect(database.connection.name).to.equal(dbName);
      expect(dbName).to.match(/^abf_chapter_test_[a-f0-9]{16}$/);
      await database.connection.dropDatabase();
    } finally {
      await database.connection.close();
    }
  });

  async function player(email = "reader@example.com") {
    const user = await models.User.create({ email, passwordHash: dummyPasswordHash });
    const session = issueSession(user, config);
    await models.Session.create({ userId: user._id, tokenHash: session.tokenHash, expiresAt: session.expiresAt });
    return { user, cookie: `${config.cookieName}=${session.token}` };
  }

  const get = (cookie, resource, targetApp = app) => request(targetApp).get(resource).set("Cookie", cookie);
  const post = (cookie, resource, body = {}) => request(app).post(resource).set("Cookie", cookie).send(body);
  const advance = (cookie, entryId) => post(cookie, progressPath, { entryId });
  const stored = (user) => models.PlayerProfile.findOne({ userId: user._id }).lean();

  async function seedFinalEntry(user) {
    await ensurePlayerProfile(models, user._id);
    await models.PlayerProfile.updateOne({ userId: user._id }, { $set: { chapterProgress: [{
      chapterId, lastEntryId: chapter.entryIds.at(-1), furthestEntryId: chapter.entryIds.at(-1), completedAt: null,
    }] } }, { runValidators: true });
  }

  it("rejects anonymous access, skipped entries, premature rewards, and client-selected grants", async () => {
    await request(app).get(progressPath).expect(401);
    await request(app).post(completePath).send({}).expect(401);
    const { user, cookie } = await player();
    await advance(cookie, 1002).expect(409);
    await post(cookie, completePath).expect(409);
    await post(cookie, "/api/game/unlocks", { chapterId, entryId: 1003 }).expect(409);
    await post(cookie, "/api/game/inventory/claim", { chapterId }).expect(409);
    for (const body of [{}, { entryId: "1001" }, { entryId: 99999 }, { entryId: 1001, userId: user.id }]) {
      await post(cookie, progressPath, body).expect(400);
    }
    await post(cookie, "/api/game/unlocks", { chapterId, entryId: 1001, factIds: chapter.factIds }).expect(400);
    await post(cookie, "/api/game/inventory/claim", { chapterId, itemId: "ancient-coin", count: 999 }).expect(400);
    await get(cookie, "/api/game/chapters/unknown/progress").expect(404);
    expect((await stored(user)).inventory).to.deep.equal([]);
  });

  it("restores reading progress, unlocks discoveries, and completes the chapter with one coin", async () => {
    const { user, cookie } = await player();
    await get(cookie, progressPath).expect(200, emptyProgress);
    await get(cookie, "/api/game/collections").expect(200, { items: [] });
    await get(cookie, "/api/game/inventory").expect(200, { capacity: 20, items: [] });
    await advance(cookie, 1001).expect(200);
    await advance(cookie, 1002).expect(200);
    const characters = await get(cookie, "/api/game/characters").expect(200);
    expect(characters.body.characters.map((entry) => entry.name)).to.have.members(["cislo", "ivan"]);
    await advance(cookie, 1003).expect(200);
    const introductions = await get(cookie, "/api/game/plots").expect(200);
    expect(introductions.body.categories.find((entry) => entry.id === "characters").entries.map((entry) => entry.id))
      .to.have.members(["cislo", "ivan", "ona"]);
    expect((await stored(user)).storyUnlocks).to.deep.equal([]);
    await advance(cookie, 1004).expect(200);
    const discovery = await post(cookie, "/api/game/unlocks", { chapterId, entryId: 1004 }).expect(200);
    expect(discovery.body.unlockedFactIds).to.deep.equal(["ancient-gold-coin-first-assignment"]);
    const first = await stored(user);
    await advance(cookie, 1001).expect(200);
    await get(cookie, progressPath, createApp({ config, models, logger }))
      .expect(200, { chapterId, entryId: 1001, furthestEntryId: 1004, completedAt: null });
    expect((await stored(user)).storyUnlocks).to.deep.equal(first.storyUnlocks);
    for (const entryId of chapter.entryIds.slice(4)) await advance(cookie, entryId).expect(200);
    expect((await stored(user)).storyUnlocks.map((entry) => entry.factId)).not.to.include("ancient-gold-coin-outcome");
    const { body } = await post(cookie, completePath).expect(200);
    expect(body.alreadyCompleted).to.equal(false);
    expect(body.awardedItems).to.deep.equal([{ itemId: "ancient-coin", count: 1 }]);
    expect(Number.isFinite(Date.parse(body.progress.completedAt))).to.equal(true);
    const inventory = await get(cookie, "/api/game/inventory").expect(200);
    expect(inventory.body.items.map(({ id, count }) => ({ id, count }))).to.deep.equal([{ id: "ancient-coin", count: 1 }]);
    const collections = await get(cookie, "/api/game/collections").expect(200);
    expect(collections.body.items.map((entry) => entry.id)).to.deep.equal(["photo-1"]);
    const plots = await get(cookie, "/api/game/plots").expect(200);
    expect(plots.body.categories.find((entry) => entry.id === "chapters").entries.map((entry) => entry.id)).to.deep.equal([chapterId]);
    expect(plots.body.categories.find((entry) => entry.id === "objects").entries).to.have.length(1);
    expect((await stored(user)).storyUnlocks.map((entry) => entry.factId)).to.have.members(chapter.factIds);
  });

  it("deduplicates concurrent completion and claim retries without affecting another account", async () => {
    const first = await player("first@example.com");
    const second = await player("second@example.com");
    await seedFinalEntry(first.user);
    const completed = await Promise.all([post(first.cookie, completePath).expect(200), post(first.cookie, completePath).expect(200)]);
    expect(completed.filter(({ body }) => !body.alreadyCompleted)).to.have.length(1);
    expect(completed.flatMap(({ body }) => body.awardedItems)).to.deep.equal([{ itemId: "ancient-coin", count: 1 }]);
    const before = await stored(first.user);
    const claim = await post(first.cookie, "/api/game/inventory/claim", { chapterId }).expect(200);
    expect(claim.body.awardedItems).to.deep.equal([]);
    const repeated = await post(first.cookie, completePath).expect(200);
    expect(repeated.body.alreadyCompleted).to.equal(true);
    expect(await stored(first.user)).to.deep.equal(before);
    await get(second.cookie, `${progressPath}?userId=${first.user.id}`).expect(200, emptyProgress);
    await get(second.cookie, "/api/game/collections").expect(200, { items: [] });
    await get(second.cookie, "/api/game/inventory").expect(200, { capacity: 20, items: [] });
    await post(second.cookie, "/api/game/inventory/claim", { chapterId }).expect(409);
  });

  it("leaves the entire profile unchanged if the reward cannot be applied", async () => {
    const { user, cookie } = await player();
    await seedFinalEntry(user);
    await models.PlayerProfile.updateOne({ userId: user._id }, {
      $set: { inventory: [{ itemId: "ancient-coin", count: Number.MAX_SAFE_INTEGER, acquiredAt: new Date() }] },
    }, { runValidators: true });
    const before = await stored(user);
    await post(cookie, completePath).expect(409);
    expect(await stored(user)).to.deep.equal(before);
  });
});
