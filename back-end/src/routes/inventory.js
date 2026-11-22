"use strict";

const { Router } = require("express");
const { inventoryFor } = require("../services/inventory");
const { claimChapterReward } = require("../services/chapters");
const { gameBody } = require("./gameInput");

const router = Router();

router.get("/", (_req, res) => {
  res.json(inventoryFor(res.locals.playerProfile));
});

router.post("/claim", ...gameBody(["chapterId"]), async (req, res) => {
  res.json(await claimChapterReward(req.app.locals.models, req.user.id, req.body.chapterId));
});

module.exports = router;
