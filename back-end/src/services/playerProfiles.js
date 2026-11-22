"use strict";

const { getCharacterProfile, getCharacterSummary } = require("../../characters");
const { getStoryFact } = require("../data/storyFacts");

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

async function grantProfileUnlocks(models, userId, requestedUnlocks = {}) {
  // Validate the entire request before creating or changing any profile.
  const { characterIds, factIds } = validateUnlocks(requestedUnlocks);
  await ensurePlayerProfile(models, userId);
  const unlockedAt = new Date();

  for (const characterId of characterIds) {
    await models.PlayerProfile.updateOne(
      { userId, "characterProgress.characterId": { $ne: characterId } },
      { $push: { characterProgress: { characterId, unlockedAt, relationshipTier: "reserved" } } },
      { runValidators: true },
    );
  }
  for (const factId of factIds) {
    // The ID predicate keeps the first date even when simultaneous requests retry.
    await models.PlayerProfile.updateOne(
      { userId, "storyUnlocks.factId": { $ne: factId } },
      { $push: { storyUnlocks: { factId, unlockedAt } } },
      { runValidators: true },
    );
  }
  return models.PlayerProfile.findOne({ userId }).lean();
}

module.exports = {
  ensurePlayerProfile,
  listUnlockedCharacters,
  getUnlockedFactIds,
  getUnlockedChatContext,
  validateUnlocks,
  grantProfileUnlocks,
};
