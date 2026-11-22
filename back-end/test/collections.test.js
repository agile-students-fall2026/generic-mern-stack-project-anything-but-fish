"use strict";

const { expect } = require("chai");
const express = require("express");
const request = require("supertest");
const { createApp } = require("../src/app");
const collectionsRouter = require("../src/routes/collections");
const { collectionItems } = require("../src/data/collections");

function appWithProgress(chapterProgress = []) {
  const app = express();
  app.use((_req, res, next) => { res.locals.playerProfile = { chapterProgress }; next(); });
  app.use("/api/game/collections", collectionsRouter);
  return app;
}

describe("GET /api/game/collections", () => {
  it("keeps collection descriptions locked before chapter completion", async () => {
    const app = appWithProgress([{ chapterId: "ancient-gold-coin", lastEntryId: 1047, completedAt: null }]);
    await request(app).get("/api/game/collections").expect(200, { items: [] });
  });

  it("returns only the completed chapter's photo with the existing response contract", async () => {
    const app = appWithProgress([{ chapterId: "ancient-gold-coin", completedAt: new Date() }]);
    const response = await request(app).get("/api/game/collections").expect(200);
    expect(response.headers["content-type"]).to.match(/json/);
    expect(response.body).to.deep.equal({ items: [collectionItems[0]] });
    expect(response.body.items[0]).to.have.all.keys("id", "title", "description");
  });

  it("requires an account and reports unavailable storage without exposing locked photos", async () => {
    const models = { PlayerProfile: { db: { readyState: 1 } } };
    await request(createApp({ models })).get("/api/game/collections").expect(401);
    await request(createApp()).get("/api/game/collections").expect(503);
  });

  it("returns 404 with a JSON detail message for an unknown route", async () => {
    await request(createApp()).get("/api/game/not-a-real-page").expect(404, { detail: "Not found" });
  });
});
