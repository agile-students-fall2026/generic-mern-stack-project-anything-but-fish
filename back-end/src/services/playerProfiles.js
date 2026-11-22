"use strict";

const { getCharacterProfile, getCharacterSummary } = require("../../characters");
const { getStoryFact } = require("../data/storyFacts");
const { HttpError } = require("../routes/auth");

async function ensurePlayerProfile(models, userId) {
  const createdAt = new Date();
  try {
    return await models.PlayerProfile.findOneAndUpdate(
      { userId },
      { $setOnInsert: {
        userId,
        characterProgress: [{ characterId: "cislo", unlockedAt: createdAt, relationshipTier: "reserved" }],
        storyUnlocks: [],
        inventory: [],
        chapterProgress: [],
        rewardClaims: [],
        gameRevision: 0,
        createdAt,
        updatedAt: createdAt,
      } },
      // Reading an existing profile must not change its timestamps or progress.
      { upsert: true, returnDocument: "after", runValidators: true, timestamps: false },
    ).lean();
  } catch (error) {
    // Two first requests can race to create the same user's profile.
    if (error.code === 11000) {
      const existing = await models.PlayerProfile.findOne({ userId }).lean();
      if (existing) return existing;
    }
    throw error;
  }
}

const fields = ["characterProgress", "storyUnlocks", "inventory", "chapterProgress", "rewardClaims"];

// All game-state writers use the same revision check. A completion and its
// rewards are committed together; a concurrent request retries against fresh data.
async function updatePlayerProfile(models, userId, mutate) {
  let profile = await ensurePlayerProfile(models, userId);
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const before = Object.fromEntries(fields.map((field) => [field, profile[field] || []]));
    const draft = structuredClone(before);
    const result = mutate(draft);
    if (JSON.stringify(before) === JSON.stringify(draft)) return { profile, result };
    const revision = profile.gameRevision || 0;
    const filter = revision === 0
      ? { $or: [{ gameRevision: 0 }, { gameRevision: { $exists: false } }] }
      : { gameRevision: revision };
    const updated = await models.PlayerProfile.findOneAndUpdate(
      { _id: profile._id, ...filter },
      { $set: draft, $inc: { gameRevision: 1 } },
      { returnDocument: "after", runValidators: true },
    ).lean();
    if (updated) return { profile: updated, result };
    profile = await models.PlayerProfile.findOne({ userId }).lean();
    if (!profile) throw new HttpError(409, "Your player profile changed. Please try again.");
  }
  throw new HttpError(409, "Your progress is being updated. Please try again.");
}

function listUnlockedCharacters(profile) {
  const seen = new Set();
  return (profile?.characterProgress || []).flatMap((progress) => {
    const character = getCharacterSummary(progress.characterId);
    if (!character || seen.has(progress.characterId)) return [];
    seen.add(progress.characterId);
    return [{ ...character, unlockedAt: progress.unlockedAt }];
  });
}

function getUnlockedFactIds(profile) {
  return [...new Set((profile?.storyUnlocks || [])
    .map((unlock) => unlock.factId)
    .filter((factId) => getStoryFact(factId)))];
}

function getUnlockedChatContext(profile, characterId) {
  const progress = profile?.characterProgress?.find((entry) => entry.characterId === characterId);
  if (!progress) return null;
  const relationshipTier = progress.relationshipTier === "more_open" ? "more_open" : "reserved";
  const character = getCharacterProfile(characterId, relationshipTier);
  if (!character) return null;

  const unlockedFacts = getUnlockedFactIds(profile)
    .map(getStoryFact)
    .filter((fact) => fact.characterIds.includes(characterId) && fact.timelines.includes(character.timeline))
    .map((fact) => fact.text);

  return { relationshipTier, unlockedFacts };
}

function validateUnlocks({ characterIds = [], factIds = [] } = {}) {
  if (!Array.isArray(characterIds) || !Array.isArray(factIds)) {
    throw new TypeError("Provide characterIds and factIds as arrays.");
  }
  for (const characterId of characterIds) {
    if (!getCharacterProfile(characterId)) throw new Error("An unknown character ID was requested.");
  }
  for (const factId of factIds) {
    if (typeof factId !== "string" || !getStoryFact(factId)) throw new Error("An unknown story fact ID was requested.");
  }
  return { characterIds: [...new Set(characterIds)], factIds: [...new Set(factIds)] };
}

function applyProfileUnlocks(profile, requestedUnlocks = {}, unlockedAt = new Date()) {
  const { characterIds, factIds } = validateUnlocks(requestedUnlocks);
  for (const characterId of characterIds) {
    if (!profile.characterProgress.some((entry) => entry.characterId === characterId)) {
      profile.characterProgress.push({ characterId, unlockedAt, relationshipTier: "reserved" });
    }
  }
  for (const factId of factIds) {
    if (!profile.storyUnlocks.some((entry) => entry.factId === factId)) {
      profile.storyUnlocks.push({ factId, unlockedAt });
    }
  }
}

async function grantProfileUnlocks(models, userId, requestedUnlocks = {}) {
  const unlocks = validateUnlocks(requestedUnlocks);
  const { profile } = await updatePlayerProfile(models, userId, (draft) => applyProfileUnlocks(draft, unlocks));
  return profile;
}

module.exports = {
  ensurePlayerProfile,
  updatePlayerProfile,
  listUnlockedCharacters,
  getUnlockedFactIds,
  getUnlockedChatContext,
  validateUnlocks,
  applyProfileUnlocks,
  grantProfileUnlocks,
};
