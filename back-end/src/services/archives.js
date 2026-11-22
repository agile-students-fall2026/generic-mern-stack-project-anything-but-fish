"use strict";

const { chapters } = require("../data/chapters");
const { collectionItems } = require("../data/collections");
const { getCharacterProfile } = require("../../characters");
const { listUnlockedCharacters } = require("./playerProfiles");
const { inventoryFor } = require("./inventory");

function completedChapters(profile) {
  const completed = new Set((profile.chapterProgress || []).filter((entry) => entry.completedAt).map((entry) => entry.chapterId));
  return chapters.filter((chapter) => completed.has(chapter.id));
}

function collectionsFor(profile) {
  const unlocked = new Set(completedChapters(profile).flatMap((chapter) => chapter.collectionIds));
  return { items: collectionItems.filter((item) => unlocked.has(item.id)) };
}

function plotsFor(profile) {
  const characters = listUnlockedCharacters(profile).map(({ name, displayName }) => {
    const character = getCharacterProfile(name);
    return { id: name, title: displayName, total: 1, collected: 1, description: [character.identity, ...character.personality] };
  });
  // The full authored chapter is bundled with the reader. This response grants
  // archive visibility without duplicating every line of the static script.
  const chapterEntries = completedChapters(profile).map((chapter) => ({
    id: chapter.id, title: chapter.title, total: 1, collected: 1, description: [],
  }));
  const objects = inventoryFor(profile).items.map((item) => ({
    id: item.id, title: item.name, total: 1, collected: 1, description: [item.description],
  }));
  return { categories: [
    { id: "characters", title: "Characters", entries: characters },
    { id: "chapters", title: "Chapters", entries: chapterEntries },
    { id: "objects", title: "Objects", entries: objects },
  ] };
}

module.exports = { collectionsFor, plotsFor };
