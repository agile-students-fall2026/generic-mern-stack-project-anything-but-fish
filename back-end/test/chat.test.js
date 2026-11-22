"use strict";

const { expect } = require("chai");
const express = require("express");
const request = require("supertest");
const { createApp } = require("../src/app");
const chatRouter = require("../src/routes/chat");
const { buildChatContext } = require("../src/services/buildChatContext");
const { getUnlockedChatContext } = require("../src/services/playerProfiles");

const chatPath = "/api/game/chat/cislo";

function appWithPlayer({ generateReply, characterIds = ["cislo"], factIds = [] } = {}) {
  const testApp = express();
  testApp.locals.generateChatReply = generateReply;
  testApp.use((req, res, next) => {
    req.user = { id: "0123456789abcdef01234567" };
    res.locals.playerProfile = {
      characterProgress: characterIds.map((characterId) => ({
        characterId,
        relationshipTier: "reserved",
        unlockedAt: new Date(),
      })),
      storyUnlocks: factIds.map((factId) => ({ factId, unlockedAt: new Date() })),
    };
    next();
  });
  testApp.use("/api/game/chat", chatRouter);
  return testApp;
}

async function withoutOpenAIKey(callback) {
  const originalKey = process.env.OPENAI_API_KEY;
  delete process.env.OPENAI_API_KEY;
  try {
    return await callback();
  } finally {
    if (originalKey === undefined) delete process.env.OPENAI_API_KEY;
    else process.env.OPENAI_API_KEY = originalKey;
  }
}

describe("/api/game/chat/:characterId", () => {
  it("lets a guest select Cislo and reuse a signed HttpOnly cookie", async () => {
    const agent = request.agent(createApp());
    const selection = await agent.get("/api/game/characters").expect(200);
    expect(selection.body.characters.map((character) => character.name))
      .to.deep.equal(["cislo"]);
    expect(selection.body.progress.unlockedFacts).to.equal(0);
    expect(selection.headers["set-cookie"][0]).to.match(/^abf_chat_guest=s%3A/);
    expect(selection.headers["set-cookie"][0]).to.include("HttpOnly");

    const history = await agent.get(chatPath).expect(200);
    expect(history.body.messages).to.deep.equal([]);
    expect(history.headers["set-cookie"]).to.be.undefined;
  });

  it("does not trust an old unsigned guest cookie", async () => {
    const response = await request(createApp()).get(chatPath)
      .set("Cookie", `abf_chat_guest=${"a".repeat(64)}`).expect(200);
    expect(response.headers["set-cookie"][0]).to.match(/^abf_chat_guest=s%3A/);
    await request(createApp()).get("/api/game/chat/ona")
      .set("Cookie", `abf_chat_guest=${"a".repeat(64)}`).expect(403);
  });

  it("keeps one continuous history per guest and isolates other visitors", async () => {
    const calls = [];
    const testApp = createApp({ generateChatReply: async (input) => {
      calls.push(input);
      buildChatContext(input);
      return `Reply to ${input.message}`;
    } });
    const first = request.agent(testApp);
    const second = request.agent(testApp);

    await first.post(chatPath).send({ message: "How is your day?" }).expect(200);
    await first.post(chatPath).send({ message: "What do you know about the coin?" }).expect(200);
    const history = await first.get(chatPath).expect(200);
    expect(history.body.messages.map((entry) => entry.role))
      .to.deep.equal(["user", "assistant", "user", "assistant"]);
    expect(calls[1].history.map((entry) => entry.content))
      .to.deep.equal(["How is your day?", "Reply to How is your day?"]);
    expect(calls[1].trustedContext.unlockedFacts).to.deep.equal([]);
    expect((await second.get(chatPath).expect(200)).body.messages).to.deep.equal([]);
  });

  it("keeps locked characters unavailable for both history and messages", async () => {
    let calls = 0;
    const testApp = createApp({ generateChatReply: async () => { calls += 1; return "Hello"; } });
    const agent = request.agent(testApp);
    for (const characterId of ["ona", "ivan"]) {
      await agent.get(`/api/game/chat/${characterId}`).expect(403);
      await agent.post(`/api/game/chat/${characterId}`)
        .send({ message: "Hello" }).expect(403);
    }
    expect(calls).to.equal(0);
  });

  it("accepts unlocked story facts but filters later-timeline events for Ona", async () => {
    const factIds = ["ancient-gold-coin-first-assignment", "ancient-gold-coin-outcome"];
    const profile = {
      characterProgress: ["cislo", "ona"].map((characterId) => ({
        characterId, relationshipTier: "reserved", unlockedAt: new Date(),
      })),
      storyUnlocks: factIds.map((factId) => ({ factId, unlockedAt: new Date() })),
    };
    const cislo = getUnlockedChatContext(profile, "cislo");
    const ona = getUnlockedChatContext(profile, "ona");
    expect(cislo.unlockedFacts).to.have.length(2);
    expect(ona.unlockedFacts).to.have.length(1);
    expect(ona.unlockedFacts[0]).to.include("first investigation");
    expect(ona.unlockedFacts.join(" ")).not.to.include("Ivan dies");

    let instructions;
    const testApp = appWithPlayer({ factIds, generateReply: async (input) => {
      instructions = buildChatContext(input).instructions;
      return "I've read the record.";
    } });
    await request(testApp).post(chatPath).send({ message: "What happened?" }).expect(200);
    expect(instructions).to.include("Ivan dies");
    expect(instructions).to.include("Conversation guidance:");
    expect(instructions).not.to.include("Chat mode:");
  });

  it("rejects unknown characters and invalid messages", async () => {
    const agent = request.agent(createApp());
    await agent.get("/api/game/chat/unknown").expect(404);
    await agent.post(chatPath).send({ message: "   " }).expect(400);
    await agent.post(chatPath).send({ message: 42 }).expect(400);
    expect((await agent.get(chatPath).expect(200)).body.messages).to.deep.equal([]);
  });

  it("reports a missing OpenAI key only after the player has chat access", async () => {
    await withoutOpenAIKey(async () => {
      const response = await request(appWithPlayer()).post(chatPath)
        .send({ message: "Hello" }).expect(503);
      expect(response.body.detail).to.equal("Chat is not configured.");
    });
  });
});
