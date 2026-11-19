const { expect } = require("chai");
const request = require("supertest");
const app = require("../src/app");
const { collectionItems } = require("../src/data/collections");

describe("GET /api/game/collections", () => {
  it("responds with status 200 and JSON", async () => {
    const res = await request(app).get("/api/game/collections");

    expect(res.status).to.equal(200);
    expect(res.headers["content-type"]).to.match(/json/);
  });

  it("returns an items array with the collection data", async () => {
    const res = await request(app).get("/api/game/collections");

    expect(res.body).to.have.property("items");
    expect(res.body.items).to.be.an("array");
    expect(res.body.items).to.deep.equal(collectionItems);
  });

  it("gives every item an id, title, and description", async () => {
    const res = await request(app).get("/api/game/collections");

    for (const item of res.body.items) {
      expect(item).to.have.all.keys("id", "title", "description");
      expect(item.id).to.be.a("string");
    }
  });

  it("returns 404 for an unknown route", async () => {
    const res = await request(app).get("/api/game/not-a-real-page");

    expect(res.status).to.equal(404);
  });

  it("returns 404 with a JSON detail message for an unknown route", async () => {
  const res = await request(app).get("/api/game/not-a-real-page");

  expect(res.status).to.equal(404);
  expect(res.body).to.have.property("detail", "Not found");
});
});