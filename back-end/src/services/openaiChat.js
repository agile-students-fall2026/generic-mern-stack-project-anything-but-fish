"use strict";

const { buildChatContext } = require("./buildChatContext");

let openaiClient;

function httpError(message, status) {
  const error = new Error(message);
  error.status = status;
  return error;
}

async function getOpenAIClient(apiKey) {
  if (!openaiClient) {
    const { default: OpenAI } = await import("openai");
    openaiClient = new OpenAI({ apiKey });
  }

  return openaiClient;
}

async function generateChatReply({
  characterId,
  message,
  history = [],
  trustedContext = {},
}) {
  const { instructions, input } = buildChatContext({
    characterId,
    message,
    history,
    trustedContext,
  });

  const apiKey = process.env.OPENAI_API_KEY?.trim();

  if (!apiKey) {
    throw httpError("Chat is not configured.", 503);
  }

  try {
    const client = await getOpenAIClient(apiKey);

    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL?.trim() || "gpt-5.4-mini",
      instructions,
      input,
      max_output_tokens: 400,
      store: false,
    });

    const reply = response.output_text?.trim();

    if (response.status !== "completed" || !reply) {
      throw new Error("The model returned no completed text.");
    }

    return reply;
  } catch (error) {
    console.error("NPC chat request failed", {
      status: error.status || null,
      requestId: error.request_id || null,
    });

    throw httpError("Chat is temporarily unavailable. Please try again.", 502);
  }
}

module.exports = { generateChatReply };