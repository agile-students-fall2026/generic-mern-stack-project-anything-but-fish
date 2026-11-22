"use strict";

// Authored facts from front-end/src/content/story/ancient-gold-coin.js.
// Stable entry IDs identify source text and unlock checkpoints, independently of page numbers.
// Ona and Ivan speak from the start of their first assignment, before its outcome.
const storyFacts = [
  {
    id: "ancient-gold-coin-first-assignment",
    chapterId: "ancient-gold-coin",
    title: "Ivan's first assignment",
    sourceEntryIds: [1002, 1003, 1004],
    unlockEntryId: 1004,
    characterIds: ["cislo", "ona", "ivan"],
    timelines: ["organization_active", "after_disappearance"],
    text: "Ona accompanies Ivan on his first investigation. Ivan is nervous, and Ona reassures him that their safety comes first and they will return if anything feels wrong.",
  },
  {
    id: "ancient-gold-coin-ore",
    chapterId: "ancient-gold-coin",
    title: "The valuable ore",
    sourceEntryIds: [1009, 1012, 1013, 1015],
    unlockEntryId: 1015,
    characterIds: ["cislo"],
    timelines: ["after_disappearance"],
    text: "The investigation record describes a miner finding ore. A merchant values it at a fortune and offers everything he owns for it. The townspeople mine day and night, hoping to sell more ore for more money.",
  },
  {
    id: "ancient-gold-coin-flood",
    chapterId: "ancient-gold-coin",
    title: "Water in the mine",
    sourceEntryIds: [1017, 1019, 1020, 1024, 1025, 1026, 1027],
    unlockEntryId: 1027,
    characterIds: ["cislo"],
    timelines: ["after_disappearance"],
    text: "The miners break through rock into an underground river. Water rushes through the mine and floods the town because the basin cannot drain fast enough. Some people do not escape, and a child calls for their mother. The record does not identify every victim or survivor.",
  },
  {
    id: "ancient-gold-coin-bridge",
    chapterId: "ancient-gold-coin",
    title: "Ona on the bridge",
    sourceEntryIds: [1038, 1039, 1042, 1043],
    unlockEntryId: 1043,
    characterIds: ["cislo"],
    timelines: ["after_disappearance"],
    text: "The investigation record shows Ona declaring that the gold is hers and Ivan calling to her. Later, Ona walks toward a pile of gold coins and trips over ore scattered on the bridge. This passage alone does not establish what happens after she trips.",
  },
  {
    id: "ancient-gold-coin-curse",
    chapterId: "ancient-gold-coin",
    title: "The coin's influence",
    sourceEntryIds: [1032, 1038, 1040, 1041],
    completionOnly: true,
    characterIds: ["cislo"],
    timelines: ["after_disappearance"],
    text: "Ona grips the coin tightly while exploring the ruined town. She later claims the gold as hers and attacks Ivan. These events suggest a connection between the coin and her possessiveness, but the record does not explain an exact mechanism or a way to reverse it.",
  },
  {
    id: "ancient-gold-coin-outcome",
    chapterId: "ancient-gold-coin",
    title: "The investigation's outcome",
    sourceEntryIds: [1040, 1041, 1043, 1044, 1045, 1046, 1047],
    completionOnly: true,
    characterIds: ["cislo"],
    timelines: ["after_disappearance"],
    text: "Ona stabs Ivan with a broken sword, and Ivan dies. Ona later trips on the bridge, and the final scene follows a fall and the coin. This investigation record does not establish the cause of the organization's later disappearance.",
  },
];

const factsById = new Map(storyFacts.map((fact) => [fact.id, fact]));

function getStoryFact(factId) {
  return factsById.get(factId) || null;
}

module.exports = { storyFacts, getStoryFact };
