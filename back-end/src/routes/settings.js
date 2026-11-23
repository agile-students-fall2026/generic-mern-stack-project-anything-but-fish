"use strict";

const { Router } = require("express");
const { HttpError } = require("./auth");
const { gameBody } = require("./gameInput");
const { defaultSettings, labels, languages } = require("../data/settings");

function createSettingsRouter() {
  const router = Router();
  // Account settings last only for this server instance; restart or redeploy resets them.
  const settingsByUser = new Map();
  const volume = (value) => Number.isInteger(value) && value >= 0 && value <= 100;

  router.get("/", (req, res) => {
    res.json({ settings: settingsByUser.get(req.user.id) || defaultSettings, labels, languages });
  });

  router.patch("/", gameBody(["soundVolume", "ambientVolume", "language"]), (req, res) => {
    const { soundVolume, ambientVolume, language } = req.body;
    if (!volume(soundVolume) || !volume(ambientVolume) || !languages.some((option) => option.value === language)) {
      throw new HttpError(400, "Provide soundVolume and ambientVolume as integers from 0 to 100, and language as en or zh.");
    }
    const settings = { soundVolume, ambientVolume, language };
    settingsByUser.set(req.user.id, settings);
    res.json({ settings, labels, languages });
  });

  return router;
}

module.exports = { createSettingsRouter };
