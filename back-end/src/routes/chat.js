"use strict";

const express = require("express");
const { rateLimit } = require("express-rate-limit");
const { getCharacterProfile } = require("../../characters");
const { generateChatReply } = require("../services/openaiChat");
const { getUnlockedChatContext } = require("../services/playerProfiles");

const router = express.Router();
const conversations = new Map();
const pending = new Set();

const MAX_CONVERSATIONS = 500;
const MAX_MESSAGES = 12;
const HISTORY_TTL_MS = 60 * 60 * 1000;
const MAX_MESSAGE_LENGTH = 2000;

const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 20,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { detail: "Too many chat messages. Please try again shortly." },
});

router.use(express.json({ limit: "8kb" }));

function identifyPlayer(req, res, next) {
  const playerId = res.locals.chatPlayerId ||
    (req.user?.id ? `user:${req.user.id}` : null);

  if (!playerId || !res.locals.playerProfile) {
    return res.status(401).json({
      detail: "A player session is required to chat.",
    });
  }

  res.locals.chatPlayerId = playerId;
  next();
}

function validateSelection(req, res, next) {
  if (!getCharacterProfile(req.params.characterId)) {
    return res.status(404).json({ detail: "Character not found." });
  }

  const context = getUnlockedChatContext(
    res.locals.playerProfile,
    req.params.characterId
  );

  if (!context) {
    return res.status(403).json({
      detail: "This character has not been unlocked yet.",
    });
  }

  res.locals.chatContext = context;
  next();
}

function conversationKey(req, res) {
  return JSON.stringify([res.locals.chatPlayerId, req.params.characterId]);
}

function readHistory(key) {
  const saved = conversations.get(key);

  if (!saved) return [];

  if (saved.expiresAt <= Date.now()) {
    conversations.delete(key);
    return [];
  }

  return saved.messages;
}

function saveHistory(key, messages) {
  conversations.delete(key);

  if (conversations.size >= MAX_CONVERSATIONS) {
    conversations.delete(conversations.keys().next().value);
  }

  conversations.set(key, {
    messages: messages.slice(-MAX_MESSAGES),
    expiresAt: Date.now() + HISTORY_TTL_MS,
  });
}

router.get("/:characterId", identifyPlayer, validateSelection, (req, res) => {
  const messages = readHistory(conversationKey(req, res)).map(
    ({ role, content }) => ({ role, content })
  );

  res.json({ messages });
});

router.post(
  "/:characterId",
  identifyPlayer,
  validateSelection,
  chatLimiter,
  async (req, res) => {
    const message = typeof req.body?.message === "string"
      ? req.body.message.trim()
      : "";

    if (!message || message.length > MAX_MESSAGE_LENGTH) {
      return res.status(400).json({
        detail: "Enter a message between 1 and 2000 characters.",
      });
    }

    const key = conversationKey(req, res);
    if (pending.has(key)) {
      return res.status(409).json({ detail: "Wait for the previous reply." });
    }

    pending.add(key);
    try {
      const history = readHistory(key);
      const generateReply = req.app.locals.generateChatReply ?? generateChatReply;
      const reply = await generateReply({
        characterId: req.params.characterId,
        message,
        history,
        trustedContext: res.locals.chatContext,
      });

      if (typeof reply !== "string" || !reply.trim()) {
        const error = new Error("The chat server returned an invalid reply.");
        error.status = 502;
        throw error;
      }

      saveHistory(key, [
        ...history,
        { role: "user", content: message },
        { role: "assistant", content: reply.trim() },
      ]);

      res.json({ reply: reply.trim() });
    } catch (error) {
      const status = [400, 404, 502, 503].includes(error.status)
        ? error.status
        : 500;

      res.status(status).json({
        detail: status === 500
          ? "Chat is temporarily unavailable. Please try again."
          : error.message,
      });
    } finally {
      pending.delete(key);
    }
  }
);

module.exports = router;