"use strict";

const { Router } = require("express");
const { unlockReachedEntry } = require("../services/chapters");
const { gameBody } = require("./gameInput");

const router = Router();
router.post("/", ...gameBody(["chapterId", "entryId"]), async (req, res) => {
  res.json(await unlockReachedEntry(req.app.locals.models, req.user.id, req.body.chapterId, req.body.entryId));
});

module.exports = router;
