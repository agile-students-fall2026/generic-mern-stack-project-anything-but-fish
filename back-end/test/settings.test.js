"use strict";

const { expect } = require("chai");
const express = require("express");
const request = require("supertest");
const { createApp } = require("../src/app");
const { createSettingsRouter } = require("../src/routes/settings");

const path = "/api/game/settings";
const defaults = { soundVolume: 70, ambientVolume: 50, language: "en" };

function appWithAccounts() {
  const app = express();
  // The production app supplies identity through authenticated player middleware.
  app.use((req, _res, next) => { req.user = { id: req.get("X-Test-User") || "alice" }; next(); });
  app.use(path, createSettingsRouter());
  app.use((error, _req, res, _next) => res.status(error.status || 500).json({ detail: error.message }));
  return app;
}

describe("Settings API", () => {
  it("returns defaults and both sets of UI text from the backend", async () => {
    const { body } = await request(appWithAccounts()).get(path).expect(200);
    expect(body.settings).to.deep.equal(defaults);
    expect(body.labels.en.title).to.equal("Settings");
    expect(body.labels.zh.title).to.equal("设置");
    for (const language of ["en", "zh"]) {
      expect(body.labels[language]).to.have.all.keys("title", "sound", "ambient", "language", "apply", "saving", "saved", "timeout");
    }
    expect(body.languages).to.deep.equal([{ value: "en", label: "English" }, { value: "zh", label: "Chinese" }]);
  });

  it("keeps settings across requests, isolates accounts, and resets on a new instance", async () => {
    const app = appWithAccounts();
    const changed = { soundVolume: 0, ambientVolume: 100, language: "zh" };
    const patched = await request(app).patch(path).send(changed).expect(200);
    expect(patched.body.settings).to.deep.equal(changed);
    await request(app).get(path).expect(200, patched.body);
    const other = await request(app).get(path).set("X-Test-User", "bob").expect(200);
    expect(other.body.settings).to.deep.equal(defaults);
    const restarted = await request(appWithAccounts()).get(path).expect(200);
    expect(restarted.body.settings).to.deep.equal(defaults);
  });

  it("rejects invalid fields and malformed bodies without overwriting settings", async () => {
    const app = appWithAccounts();
    const changed = { soundVolume: 20, ambientVolume: 30, language: "zh" };
    await request(app).patch(path).send(changed).expect(200);
    for (const body of [
      [], {}, { soundVolume: 70, language: "en" },
      { ...defaults, soundVolume: -1 }, { ...defaults, ambientVolume: 101 },
      { ...defaults, soundVolume: 1.5 }, { ...defaults, soundVolume: "70" },
      { ...defaults, language: "fr" }, { ...defaults, userId: "bob" },
    ]) {
      await request(app).patch(path).send(body).expect(400);
    }
    await request(app).patch(path).set("Content-Type", "application/json").send("{").expect(400);
    await request(app).patch(path).type("text").send("settings").expect(415);
    const { body } = await request(app).get(path).expect(200);
    expect(body.settings).to.deep.equal(changed);
  });

  it("requires an account for reads and writes through the production middleware", async () => {
    const models = { PlayerProfile: { db: { readyState: 1 } } };
    const app = createApp({ models });
    await request(app).get(path).expect(401);
    await request(app).patch(path).send(defaults).expect(401);
    await request(createApp()).get(path).expect(503);
  });

  it("allows credentialed PATCH preflights from the configured frontend", async () => {
    const response = await request(createApp()).options(path)
      .set("Origin", "http://localhost:5173")
      .set("Access-Control-Request-Method", "PATCH")
      .set("Access-Control-Request-Headers", "content-type").expect(204);
    expect(response.headers["access-control-allow-origin"]).to.equal("http://localhost:5173");
    expect(response.headers["access-control-allow-credentials"]).to.equal("true");
    expect(response.headers["access-control-allow-methods"].split(",")).to.include("PATCH");
  });
});
