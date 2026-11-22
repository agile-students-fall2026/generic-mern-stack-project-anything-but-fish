"use strict";

const profiles = require("./profiles.js");

const CHARACTER_ID_PATTERN = /^[a-zA-Z0-9_-]+$/;

if (
  !profiles ||
  typeof profiles !== "object" ||
  !profiles.characters ||
  typeof profiles.chatRule !== "string" ||
  !profiles.chatRule.trim()
) {
  throw new Error("Invalid character profiles configuration.");
}

function getChatRule() {
  return profiles.chatRule;
}

function getCharacterProfile(characterId, relationshipTier = "reserved") {
  if (
    typeof characterId !== "string" ||
    !CHARACTER_ID_PATTERN.test(characterId) ||
    !Object.hasOwn(profiles.characters, characterId)
  ) {
    return null;
  }

  const character = profiles.characters[characterId];

  if (!character || character.id !== characterId) {
    return null;
  }

  const { relationshipTiers, nameInspiration, ...baseProfile } = character;
  const selectedProfile = structuredClone(baseProfile);

  if (relationshipTiers) {
    const tierName =
      relationshipTier === "more_open" ? "more_open" : "reserved";

    const tier = relationshipTiers[tierName];

    if (!tier) {
      throw new Error(`Missing relationship tier: ${tierName}`);
    }

    selectedProfile.relationship = structuredClone(tier);
  }

  return selectedProfile;
}

function getCharacterSummary(characterId) {
  const character = getCharacterProfile(characterId);

  if (!character) {
    return null;
  }

  return {
    name: character.id,
    displayName: character.displayName,
  };
}

module.exports = {
  getChatRule,
  getCharacterProfile,
  getCharacterSummary,
};