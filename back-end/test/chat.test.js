"use strict";

const { expect } = require("chai");
const express = require("express");
const request = require("supertest");
const app = require("../src/app");
const chatRouter = require("../src/routes/chat");

const chatPath = "/api/game/chat/cislo";

function appWithPlayer() {
  const testApp = express();

  testApp.use((req, res, next) => {
    res.locals.user = { id: "test-player" };
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
    if (originalKey === undefined) {
      delete process.env.OPENAI_API_KEY;
    } else {
      process.env.OPENAI_API_KEY = originalKey;
    }
  }
}

describe("/api/game/chat/:characterId", () => {
  it("starts a guest conversation without requiring sign-in", async () => {
    const res = await request(app).get(`${chatPath}?mode=daily`);

    expect(res.status).to.equal(200);
    expect(res.body.messages).to.deep.equal([]);

    const cookie = res.headers["set-cookie"]?.find((value) =>
      value.startsWith("abf_chat_guest=")
    );

    expect(cookie).to.be.a("string");
    expect(cookie).to.include("HttpOnly");
    expect(cookie).to.include("SameSite=Lax");
  });

  it("reuses the same guest cookie on later requests", async () => {
    const first = await request(app).get(`${chatPath}?mode=daily`);
    const cookie = first.headers["set-cookie"].find((value) =>
      value.startsWith("abf_chat_guest=")
    );
    const second = await request(app)
      .get(`${chatPath}?mode=daily`)
      .set("Cookie", cookie.split(";")[0]);

    expect(second.status).to.equal(200);
    expect(second.body.messages).to.deep.equal([]);
    expect(second.headers["set-cookie"]).to.be.undefined;
  });

  it("issues different identifiers to different guests", async () => {
    const first = await request(app).get(`${chatPath}?mode=daily`);
    const second = await request(app).get(`${chatPath}?mode=daily`);

    const firstCookie = first.headers["set-cookie"].find((value) =>
      value.startsWith("abf_chat_guest=")
    );
    const secondCookie = second.headers["set-cookie"].find((value) =>
      value.startsWith("abf_chat_guest=")
    );

    expect(firstCookie.split(";")[0]).not.to.equal(
      secondCookie.split(";")[0]
    );
  });

  it("allows a guest POST to reach chat configuration", async () => {
    await withoutOpenAIKey(async () => {
      const res = await request(app)
        .post(chatPath)
        .send({ mode: "daily", message: "Hello" });

      expect(res.status).to.equal(503);
      expect(res.body.detail).to.equal("Chat is not configured.");
    });
  });

  it("returns an empty history for a signed-in player", async () => {
    const res = await request(appWithPlayer()).get(
      `${chatPath}?mode=daily`
    );

    expect(res.status).to.equal(200);
    expect(res.body.messages).to.deep.equal([]);
    expect(res.headers["set-cookie"]).to.be.undefined;
  });

  it("rejects an unknown character", async () => {
    const res = await request(app).get(
      "/api/game/chat/unknown?mode=daily"
    );

    expect(res.status).to.equal(404);
  });

  it("rejects an invalid chat mode", async () => {
    const res = await request(app).get(
      `${chatPath}?mode=invalid`
    );

    expect(res.status).to.equal(400);
  });

  it("rejects a blank message", async () => {
    const res = await request(app)
      .post(chatPath)
      .send({ mode: "daily", message: "   " });

    expect(res.status).to.equal(400);
  });

  it("reports when the OpenAI key is not configured", async () => {
    await withoutOpenAIKey(async () => {
      const res = await request(appWithPlayer())
        .post(chatPath)
        .send({ mode: "daily", message: "Hello" });

      expect(res.status).to.equal(503);
      expect(res.body.detail).to.equal("Chat is not configured.");
    });
  });
});