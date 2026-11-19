"use strict";

const { Router } = require("express");
const { collectionItems } = require("../data/collections");

const router = Router();

// Full URL: GET /api/game/collections (prefix is added in app.js)
router.get("/", (req, res) => {
  res.json({ items: collectionItems });
});

module.exports = router;