"use strict";

const { randomBytes } = require("node:crypto");
const assert = require("node:assert/strict");
const express = require("express");
const mongoose = require("mongoose");
const { expect } = require("chai");
const request = require("supertest");
const { createApp } = require("../src/app");
const { createModels, connectDatabase } = require("../src/database");
const { readConfig } = require("../src/config");
const { dummyPasswordHash, issueSession } = require("../src/security");
const { ensurePlayerProfile } = require("../src/services/playerProfiles");
const inventoryRouter = require("../src/routes/inventory");
const { itemCatalog } = require("../src/data/items");

describe("Inventory schema and response", () => {
  const connection = mongoose.createConnection();
  const { PlayerProfile } = createModels(connection);
  after(() => connection.close());

  function profile(inventory) {
    return new PlayerProfile({ userId: new mongoose.Types.ObjectId(), inventory });
  }

  function appWithProfile(playerProfile) {
    const app = express();
    app.use((_req, res, next) => { res.locals.playerProfile = playerProfile; next(); });
    app.use("/api/game/inventory", inventoryRouter);
    return app;
  }

  it("starts empty and stores item references, quantities, and acquisition dates", async () => {
    expect(profile().inventory).to.have.length(0);
    const owned = profile([{ itemId: "ancient-coin", count: 2 }]);
    await owned.validate();
    expect(owned.inventory[0].acquiredAt).to.be.instanceOf(Date);
    expect(owned.inventory[0].toObject()).to.have.all.keys("itemId", "count", "acquiredAt");
  });

  it("rejects unknown items, invalid counts, and duplicate stacks", async () => {
    for (const inventory of [
      [{ itemId: "unknown", count: 1 }],
      ...[0, -1, 1.5, Number.MAX_SAFE_INTEGER + 1].map((count) => [{ itemId: "ancient-coin", count }]),
      [{ itemId: "ancient-coin", count: 1 }, { itemId: "ancient-coin", count: 2 }],
    ]) await assert.rejects(profile(inventory).validate(), { name: "ValidationError" });
  });

  it("serves older profiles without inventory as an empty backpack", async () => {
    await request(appWithProfile({ storyUnlocks: [] })).get("/api/game/inventory")
      .expect(200, { capacity: 20, items: [] });
  });

  it("combines only owned item IDs with server definitions without exposing profile fields", async () => {
    const playerProfile = {
      userId: "private-user", storyUnlocks: [{ factId: "secret" }],
      inventory: [{ itemId: "ancient-coin", count: 3, acquiredAt: new Date(), name: "Forged name" }],
    };
    const response = await request(appWithProfile(playerProfile)).get("/api/game/inventory").expect(200);
    expect(response.body).to.deep.equal({
      capacity: 20, items: [{ ...itemCatalog.find((item) => item.id === "ancient-coin"), count: 3 }],
    });
  });

  it("requires authentication and reports unavailable storage instead of preview data", async () => {
    await request(createApp()).get("/api/game/inventory").expect(503);
    const models = { PlayerProfile: { db: { readyState: 1 } } };
    const app = createApp({ models });
    await request(app).get("/api/game/inventory").expect(401);
    await request(app).get("/api/game/inventory").set("Cookie", "abf_session=invalid").expect(401);
  });
});

describe("MongoDB account inventory", function () {
  let database, models, config, app;
  const dbName = `abf_inventory_test_${randomBytes(8).toString("hex")}`;

  before(async function () {
    const mongodbUri = process.env.TEST_MONGODB_URI;
    if (!mongodbUri) return this.skip();
    config = readConfig({ MONGODB_URI: mongodbUri, MONGODB_DB_NAME: dbName, JWT_SECRET: "i".repeat(64) });
    database = await connectDatabase(config);
    models = database.models;
    app = createApp({ config, models });
  });

  afterEach(async () => {
    if (models) await Promise.all(Object.values(models).map((model) => model.deleteMany({})));
  });

  after(async () => {
    if (!database) return;
    try {
      expect(database.connection.name).to.equal(dbName);
      expect(dbName).to.match(/^abf_inventory_test_[a-f0-9]{16}$/);
      await database.connection.dropDatabase();
    } finally {
      await database.connection.close();
    }
  });

  async function player(email) {
    const user = await models.User.create({ email, passwordHash: dummyPasswordHash });
    const session = issueSession(user, config);
    await models.Session.create({ userId: user._id, tokenHash: session.tokenHash, expiresAt: session.expiresAt });
    return { user, cookie: `${config.cookieName}=${session.token}` };
  }

  it("creates an empty profile for a new account without granting preview relics", async () => {
    const { user, cookie } = await player("new@example.com");
    await request(app).get("/api/game/inventory").set("Cookie", cookie)
      .expect(200, { capacity: 20, items: [] });
    expect((await models.PlayerProfile.findOne({ userId: user._id })).inventory).to.have.length(0);
  });

  it("keeps stored items across app recreation and isolates different accounts", async () => {
    const first = await player("first@example.com");
    const second = await player("second@example.com");
    await ensurePlayerProfile(models, first.user._id);
    const stored = await models.PlayerProfile.findOne({ userId: first.user._id });
    stored.inventory = [{ itemId: "ancient-coin", count: 2 }];
    await stored.save();

    const recreated = createApp({ config, models });
    const response = await request(recreated).get("/api/game/inventory").set("Cookie", first.cookie).expect(200);
    expect(response.headers["cache-control"]).to.equal("no-store");
    expect(response.body.items).to.deep.equal([{ ...itemCatalog[0], count: 2 }]);
    await request(recreated).get(`/api/game/inventory?userId=${first.user.id}`)
      .set("Cookie", second.cookie).expect(200, { capacity: 20, items: [] });
    await request(recreated).post("/api/game/inventory").set("Cookie", second.cookie)
      .send({ itemId: "ancient-coin", count: 999 }).expect(404);
    expect((await models.PlayerProfile.findOne({ userId: first.user._id })).inventory[0].count).to.equal(2);
  });

  it("reads an older profile without resetting existing unlocks or timestamps", async () => {
    const { user, cookie } = await player("old@example.com");
    const oldDate = new Date("2026-01-01T00:00:00Z");
    await models.PlayerProfile.collection.insertOne({
      userId: user._id, characterProgress: [{ characterId: "ona", unlockedAt: oldDate, relationshipTier: "reserved" }],
      storyUnlocks: [], createdAt: oldDate, updatedAt: oldDate,
    });
    await request(app).get("/api/game/inventory").set("Cookie", cookie)
      .expect(200, { capacity: 20, items: [] });
    const stored = await models.PlayerProfile.collection.findOne({ userId: user._id });
    expect(stored.characterProgress.map((entry) => entry.characterId)).to.deep.equal(["ona"]);
    expect(stored.updatedAt.toISOString()).to.equal(oldDate.toISOString());
  });
});
