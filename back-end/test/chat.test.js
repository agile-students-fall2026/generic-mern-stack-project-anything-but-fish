"use strict";

const { expect } = require("chai");
const express = require("express");
const request = require("supertest");
const app = require("../src/app");
const { createChatRouter } = require("../src/routes/chat");
const { buildChatContext } = require("../src/services/buildChatContext");

const chatPath = "/api/game/chat/cislo";

function appWithPlayer({ signedIn = true, generateReply } = {}) {
  const testApp = express();
  if (signedIn) {
    testApp.use((req, res, next) => {
      req.user = { id: "0123456789abcdef01234567" };
      res.locals.playerProfile = {
        userId: req.user.id,
        characterProgress: [{ characterId: "cislo", relationshipTier: "reserved", unlockedAt: new Date() }],
        storyUnlocks: [],
      };
      next();
    });
  }
  testApp.use("/api/game/chat", createChatRouter({ generateReply }));
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
  it("reports unavailable personal progress when the database is not configured", async () => {
    for (const path of ["/api/game/characters", `${chatPath}?mode=daily`]) {
      const response = await request(app).get(path).expect(503);
      expect(response.body.detail).to.be.a("string");
      expect(response.headers["set-cookie"]).to.be.undefined;
    }
    await request(app).post(chatPath).send({ mode: "daily", message: "Hello" }).expect(503);
  });

  it("does not grant chat access through an old guest cookie", async () => {
    const testApp = appWithPlayer({ signedIn: false });
    await request(testApp).get(`${chatPath}?mode=daily`)
      .set("Cookie", `abf_chat_guest=${"a".repeat(64)}`).expect(401);
    await request(testApp).post(chatPath)
      .set("Cookie", `abf_chat_guest=${"a".repeat(64)}`)
      .send({ mode: "daily", message: "Hello" }).expect(401);
  });

  it("returns an empty history for an unlocked character", async () => {
    const response = await request(appWithPlayer()).get(`${chatPath}?mode=daily`).expect(200);
    expect(response.body.messages).to.deep.equal([]);
    expect(response.headers["set-cookie"]).to.be.undefined;
  });

  it("blocks both history and messages for locked characters before invoking the model", async () => {
    let calls = 0;
    const testApp = appWithPlayer({ generateReply: async () => { calls += 1; return "Hello"; } });
    for (const characterId of ["ona", "ivan"]) {
      await request(testApp).get(`/api/game/chat/${characterId}?mode=daily`).expect(403);
      await request(testApp).post(`/api/game/chat/${characterId}`)
        .send({ mode: "daily", message: "Hello" }).expect(403);
    }
    expect(calls).to.equal(0);
  });

  it("rejects unknown characters and invalid modes", async () => {
    const testApp = appWithPlayer();
    await request(testApp).get("/api/game/chat/unknown?mode=daily").expect(404);
    await request(testApp).get(`${chatPath}?mode=invalid`).expect(400);
  });

  it("rejects a blank message without adding conversation history", async () => {
    const testApp = appWithPlayer({ generateReply: async (input) => {
      buildChatContext(input);
      return "Hello";
    } });
    await request(testApp).post(chatPath).send({ mode: "daily", message: "   " }).expect(400);
    const response = await request(testApp).get(`${chatPath}?mode=daily`).expect(200);
    expect(response.body.messages).to.deep.equal([]);
  });

  it("reports a missing model key only after the player has chat access", async () => {
    await withoutOpenAIKey(async () => {
      const response = await request(appWithPlayer()).post(chatPath)
        .send({ mode: "daily", message: "Hello" }).expect(503);
      expect(response.body.detail).to.equal("Chat is not configured.");
    });
  });
});
