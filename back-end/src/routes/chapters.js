"use strict";

const { Router } = require("express");
const { progressFor, recordProgress, completeChapter } = require("../services/chapters");
const { gameBody } = require("./gameInput");

const router = Router();

router.get("/:chapterId/progress", (req, res) => {
  res.json(progressFor(res.locals.playerProfile, req.params.chapterId));
});

router.post("/:chapterId/progress", ...gameBody(["entryId"]), async (req, res) => {
  res.json(await recordProgress(req.app.locals.models, req.user.id, req.params.chapterId, req.body.entryId));
});

router.post("/:chapterId/complete", ...gameBody([]), async (req, res) => {
  res.json(await completeChapter(req.app.locals.models, req.user.id, req.params.chapterId));
});

module.exports = router;
