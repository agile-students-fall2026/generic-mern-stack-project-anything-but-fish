"use strict";

// Authored facts from front-end/src/content/story/ancient-gold-coin.js.
// Page references identify the source text; visiting a page does not grant access.
// Ona and Ivan speak from the start of their first assignment, before its outcome.
const storyFacts = [
  {
    id: "ancient-gold-coin-first-assignment",
    chapterId: "ancient-gold-coin",
    title: "Ivan's first assignment",
    sourcePages: [2, 3, 4],
    characterIds: ["cislo", "ona", "ivan"],
    timelines: ["organization_active", "after_disappearance"],
    text: "Ona accompanies Ivan on his first investigation. Ivan is nervous, and Ona reassures him that their safety comes first and they will return if anything feels wrong.",
  },
  {
    id: "ancient-gold-coin-ore",
    chapterId: "ancient-gold-coin",
    title: "The valuable ore",
    sourcePages: [6, 7, 8],
    characterIds: ["cislo"],
    timelines: ["after_disappearance"],
    text: "The investigation record describes a miner finding ore. A merchant offers a fortune for it, word spreads through the town, and the miner continues digging for more money.",
  },
  {
    id: "ancient-gold-coin-flood",
    chapterId: "ancient-gold-coin",
    title: "Water in the mine",
    sourcePages: [9, 10, 11, 12],
    characterIds: ["cislo"],
    timelines: ["after_disappearance"],
    text: "The investigation record describes water seeping through rock while the miner keeps digging. The wall gives way, and a child calls for their mother. These passages do not establish who survived.",
  },
  {
    id: "ancient-gold-coin-bridge",
    chapterId: "ancient-gold-coin",
    title: "Ona on the bridge",
    sourcePages: [16, 17, 18],
    characterIds: ["cislo"],
    timelines: ["after_disappearance"],
    text: "The investigation record shows Ona claiming the ore as hers. Ivan calls to her, and she trips over ore scattered on the bridge and falls. This passage alone does not establish what happened after her fall.",
  },
  {
    id: "ancient-gold-coin-curse",
    chapterId: "ancient-gold-coin",
    title: "The cursed gold coin",
    sourcePages: [19, 20],
    characterIds: ["cislo"],
    timelines: ["after_disappearance"],
    text: "The case file identifies the item as a cursed gold coin. Contact with it creates an intense desire for it, and those affected will do whatever it takes to obtain more.",
  },
  {
    id: "ancient-gold-coin-outcome",
    chapterId: "ancient-gold-coin",
    title: "The sealed investigation",
    sourcePages: [21],
    characterIds: ["cislo"],
    timelines: ["after_disappearance"],
    text: "The case file labels the investigation outcome as failed and states that the file was sealed. It does not establish the cause of the organization's later disappearance.",
  },
];

const factsById = new Map(storyFacts.map((fact) => [fact.id, fact]));

function getStoryFact(factId) {
  return factsById.get(factId) || null;
}

module.exports = { storyFacts, getStoryFact };
