// Standalone demo content and state; no real account data is stored here.
export const chapterPreview = {
  id: "ancient-gold-coin",
  title: "An Ancient Gold Coin",
  entryIds: [
    1001, 1002, 1003, 1004, 1005, 1006, 1007, 1008, 1009, 1010,
    1011, 1012, 1013, 1014, 1015, 1016, 1017, 1018, 1019, 1020,
    1021, 1022, 1023, 1024, 1025, 1026, 1027, 1028, 1029, 1030,
    1031, 1032, 1033, 1034, 1035, 1036, 1037, 1038, 1039, 1040,
    1041, 1042, 1043, 1044, 1045, 1046, 1047,
  ],
  characterUnlocks: [{ entryId: 1002, characterId: "ivan" }, { entryId: 1003, characterId: "ona" }],
};

export const chapterCharacters = [
  { name: "cislo", displayName: "Cislobog Raskolnikova", description: "A curious, persistent woman investigating the disappearance of a mysterious fishing organization." },
  { name: "ona", displayName: "Ona Laimaitė", description: "A senior investigator guiding Ivan through his first assignment. She reassures him that their safety comes first." },
  { name: "ivan", displayName: "Ivan Likhov", description: "A young investigator on his first assignment. He is friendly, eager to learn, and nervous about what awaits him." },
];

export const chapterCollection = {
  id: "photo-1",
  title: "Ancient gold coin",
  description: "Desire drives two researchers to fight over a rare mineral. The mineral is cursed: the more people possess, the more they crave. Their conflict ends in a fatal stabbing.",
};

export const initialChapterProgress = {
  chapterId: chapterPreview.id,
  entryId: null,
  furthestEntryId: null,
  completedAt: null,
};
