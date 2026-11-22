"use strict";

const { Router } = require("express");
const { collectionsFor } = require("../services/archives");

const router = Router();

// Full URL: GET /api/game/collections (prefix is added in app.js)
router.get("/", (req, res) => {
  res.json(collectionsFor(res.locals.playerProfile));
});

module.exports = router;
