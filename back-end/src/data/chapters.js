"use strict";

const { storyFacts } = require("./storyFacts");

const chapters = [
  {
    id: "ancient-gold-coin",
    title: "An Ancient Gold Coin",
    // Reading order is explicit. New entries get new IDs, never a renumbering.
    entryIds: [
      1001, 1002, 1003, 1004, 1005, 1006, 1007, 1008, 1009, 1010,
      1011, 1012, 1013, 1014, 1015, 1016, 1017, 1018, 1019, 1020,
      1021, 1022, 1023, 1024, 1025, 1026, 1027, 1028, 1029, 1030,
      1031, 1032, 1033, 1034, 1035, 1036, 1037, 1038, 1039, 1040,
      1041, 1042, 1043, 1044, 1045, 1046, 1047,
    ],
    characterUnlocks: [
      { entryId: 1002, characterId: "ivan" },
      { entryId: 1003, characterId: "ona" },
    ],
    collectionIds: ["photo-1"],
    rewards: [{ itemId: "ancient-coin", count: 1 }],
    factIds: storyFacts.filter((fact) => fact.chapterId === "ancient-gold-coin").map((fact) => fact.id),
  },
];

function getChapter(chapterId) {
  return chapters.find((chapter) => chapter.id === chapterId) || null;
}

module.exports = { chapters, getChapter };
