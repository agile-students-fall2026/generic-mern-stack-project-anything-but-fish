"use strict";

const { Router } = require("express");
const { listUnlockedCharacters, getUnlockedFactIds } = require("../services/playerProfiles");

const router = Router();

router.get("/", (_req, res) => {
  const profile = res.locals.playerProfile;
  const characters = listUnlockedCharacters(profile);
  res.json({
    characters,
    progress: {
      unlockedCharacters: characters.length,
      unlockedFacts: getUnlockedFactIds(profile).length,
    },
  });
});

module.exports = router;
