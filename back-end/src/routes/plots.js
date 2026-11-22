"use strict";

const { Router } = require("express");
const { plotsFor } = require("../services/archives");

const router = Router();
router.get("/", (_req, res) => res.json(plotsFor(res.locals.playerProfile)));

module.exports = router;
