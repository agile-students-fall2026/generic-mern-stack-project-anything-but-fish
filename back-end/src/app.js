"use strict";

const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const helmet = require("helmet");
const { readConfig } = require("./config");
const { createAuthRouter, readAccount, HttpError } = require("./routes/auth");
const collectionsRouter = require("./routes/collections");
const charactersRouter = require("./routes/characters");
const inventoryRouter = require("./routes/inventory");
const chatRouter = require("./routes/chat");
const { ensurePlayerProfile } = require("./services/playerProfiles");

function createApp({ config = readConfig({}, { requireDatabase: false }), models, logger = console, generateChatReply } = {}) {
  const app = express();
  app.locals.generateChatReply = generateChatReply;
  const frontendOrigins = config.frontendOrigins ?? [config.frontendOrigin];
  app.disable("x-powered-by");
  app.set("trust proxy", config.trustProxy);
  app.use(helmet());
  app.use(cors({
    origin: frontendOrigins,
    credentials: true,
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Accept"],
  }));
  app.use(cookieParser());
  app.use("/api", (req, res, next) => {
    res.set("Cache-Control", "no-store");
    if (req.get("origin") && !frontendOrigins.includes(req.get("origin"))) {
      return next(new HttpError(403, "This request origin is not allowed."));
    }
    next();
  });

  app.get("/api/health", (_req, res) => {
    if (!models) return res.json({ status: "ok", authentication: "unavailable" });
    const ready = models.User.db.readyState === 1;
    res.status(ready ? 200 : 503).json({ status: ready ? "ok" : "unavailable" });
  });

  if (models) {
    app.use("/api/auth", createAuthRouter({ config, models }));
  } else {
    app.use("/api/auth", (_req, res) => {
      res.status(503).json({ detail: "Authentication is not configured. Set MONGODB_URI and JWT_SECRET on the server." });
    });
  }

  app.use("/api/game/collections", collectionsRouter);
  async function requirePlayerProfile(req, res, next) {
    if (!models?.PlayerProfile || models.PlayerProfile.db.readyState !== 1) {
      throw new HttpError(503, "Player progress is unavailable. Check the server's database configuration.");
    }
    const user = await readAccount(req, { config, models });
    if (!user) throw new HttpError(401, "Please log in to access your game progress.");
    req.user = { id: user.id };
    res.locals.playerProfile = await ensurePlayerProfile(models, user._id);
    next();
  }
  app.use("/api/game/characters", requirePlayerProfile, charactersRouter);
  app.use("/api/game/inventory", requirePlayerProfile, inventoryRouter);
  app.use("/api/game/chat", requirePlayerProfile, chatRouter);

  app.use((_req, res) => res.status(404).json({ detail: "Not found" }));
  app.use((error, _req, res, _next) => {
    if (error instanceof HttpError) return res.status(error.status).json({ detail: error.message });
    if (error.type === "entity.parse.failed") return res.status(400).json({ detail: "Send a valid JSON object." });
    if (error.type === "entity.too.large") return res.status(413).json({ detail: "The request is too large." });
    logger.error("API request failed.", { name: error.name });
    res.status(500).json({ detail: "The server could not complete your request. Please try again." });
  });
  return app;
}

// Importing the app does not open a database connection or start a listener.
module.exports = createApp();
module.exports.createApp = createApp;
