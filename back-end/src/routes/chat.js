"use strict";

const express = require("express");
const {
  getCharacterProfile,
  getChatModeRule,
} = require("../../characters");
const { generateChatReply } = require("../services/openaiChat");

const router = express.Router();
const conversations = new Map();
const pending = new Set();

const MAX_CONVERSATIONS = 500;
const MAX_MESSAGES = 12;
const HISTORY_TTL_MS = 60 * 60 * 1000;

router.use(express.json({ limit: "8kb" }));

function getPlayerId(req, res) {
  const id = req.user?.id ?? res.locals.user?.id ?? req.session?.userId;
  return id === undefined || id === null || id === ""
    ? null
    : String(id);
}

function requirePlayer(req, res, next) {
  const playerId = getPlayerId(req, res);

  if (!playerId) {
    return res.status(401).json({ detail: "Please sign in to chat." });
  }

  res.locals.chatPlayerId = playerId;
  next();
}

function validateSelection(req, res, next) {
  const mode = req.method === "GET" ? req.query.mode : req.body?.mode;

  if (!getCharacterProfile(req.params.characterId)) {
    return res.status(404).json({ detail: "Character not found." });
  }

  if (!getChatModeRule(mode)) {
    return res.status(400).json({ detail: "Choose a valid chat mode." });
  }

  res.locals.chatMode = mode;
  next();
}

function conversationKey(req, res) {
  return JSON.stringify([
    res.locals.chatPlayerId,
    req.params.characterId,
    res.locals.chatMode,
  ]);
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

router.get("/:characterId", requirePlayer, validateSelection, (req, res) => {
  const messages = readHistory(conversationKey(req, res)).map(
    ({ role, content }) => ({ role, content })
  );

  res.json({ messages });
});

router.post(
  "/:characterId",
  requirePlayer,
  validateSelection,
  async (req, res) => {
    const key = conversationKey(req, res);

    if (pending.has(key)) {
      return res.status(409).json({
        detail: "Wait for the previous reply.",
      });
    }

    pending.add(key);

    try {
      const history = readHistory(key);
      const mode = res.locals.chatMode;
      const message = req.body?.message;

      const reply = await generateChatReply({
        characterId: req.params.characterId,
        mode,
        message,
        history,
        trustedContext: res.locals.chatContext ?? {},
      });

      saveHistory(key, [
        ...history,
        { mode, role: "user", content: message.trim() },
        { mode, role: "assistant", content: reply },
      ]);

      res.json({ reply });
    } catch (error) {
      const status = [400, 404, 502, 503].includes(error.status)
        ? error.status
        : 500;

      res.status(status).json({
        detail:
          status === 500
            ? "Chat is temporarily unavailable. Please try again."
            : error.message,
      });
    } finally {
      pending.delete(key);
    }
  }
);

module.exports = router;