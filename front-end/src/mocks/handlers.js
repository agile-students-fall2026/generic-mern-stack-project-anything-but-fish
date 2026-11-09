import { http, HttpResponse } from "msw/http";
import { delay } from "msw/utils/delay";
import { plotCatalog, collectionCatalog, characterCatalog } from "./fixtures/catalog.js";
import { previewProfiles } from "./fixtures/profiles.js";
import { inventoryPreview } from "./fixtures/inventory.js";
import { settingsPreview } from "./fixtures/settings.js";
import { saveSlotsPreview } from "./fixtures/saves.js";

const volume = (value) => Number.isInteger(value) && value >= 0 && value <= 100;
const exactFields = (data, fields) => data && typeof data === "object" && !Array.isArray(data)
  && Object.keys(data).length === fields.length && fields.every((field) => Object.hasOwn(data, field));

function plotsFor(profile) {
  return plotCatalog.map((category) => ({
    ...category,
    entries: category.entries.flatMap((entry) => {
      const count = profile.plotProgress[category.id]?.[entry.id] ?? 0;
      const collected = Number.isFinite(count) ? Math.min(entry.total, Math.max(0, Math.floor(count))) : 0;
      return collected > 0 ? [{ ...entry, collected }] : [];
    }),
  }));
}

export function createGameHandlers({ baseUrl = "/api", scenario = "demo", delayMs = 250, profile } = {}) {
  if (typeof baseUrl !== "string" || !baseUrl.trim()) {
    throw new Error("Game mock baseUrl must be a nonempty string.");
  }
  if (!["demo", "empty", "error"].includes(scenario)) {
    throw new Error("Game mock scenario must be demo, empty, or error.");
  }
  if (!Number.isInteger(delayMs) || delayMs < 0 || delayMs > 60000) {
    throw new Error("Game mock delayMs must be an integer between 0 and 60000.");
  }
  const apiBase = baseUrl.replace(/\/+$/, "");
  const currentProfile = profile ?? previewProfiles[scenario === "empty" ? "empty" : "demo"];
  let settings = { ...settingsPreview };
  const slots = structuredClone(saveSlotsPreview).map((slot) => scenario === "empty" ? { ...slot, save: null } : slot);
  const headers = { "Cache-Control": "no-store", "X-Mock-Data": "shared-preview" };
  const fail = (detail, status) => HttpResponse.json({ detail }, { status, headers });
  const respond = (getData) => async (info) => {
    if (delayMs > 0) await delay(delayMs);
    if (scenario === "error") {
      return HttpResponse.json(
        { detail: "The game preview is unavailable in the error scenario." },
        { status: 503, headers },
      );
    }
    const data = await getData(info);
    return data instanceof Response ? data : HttpResponse.json(data, { headers });
  };

  // Only these game routes are mocked. Authentication and all other traffic pass through.
  return [
    http.get(`${apiBase}/game/plots`, respond(() => ({ categories: plotsFor(currentProfile) }))),
    http.get(`${apiBase}/game/collections`, respond(() => ({
      items: collectionCatalog.filter((item) => currentProfile.unlockedCollectionIds.includes(item.id)),
    }))),
    http.get(`${apiBase}/game/characters`, respond(() => ({
      characters: characterCatalog.filter((character) => currentProfile.unlockedCharacterIds.includes(character.name)),
    }))),
    http.get(`${apiBase}/game/inventory`, respond(() => ({
      capacity: inventoryPreview.capacity,
      items: scenario === "empty" ? [] : inventoryPreview.items,
    }))),
    http.get(`${apiBase}/game/settings`, respond(() => ({ settings }))),
    http.patch(`${apiBase}/game/settings`, respond(async ({ request }) => {
      const data = await request.json().catch(() => null);
      if (!exactFields(data, ["soundVolume", "ambientVolume", "language"])
        || !volume(data.soundVolume) || !volume(data.ambientVolume) || !["en", "zh"].includes(data.language)) {
        return fail("Provide soundVolume and ambientVolume as integers from 0 to 100, and language as en or zh.", 400);
      }
      settings = { soundVolume: data.soundVolume, ambientVolume: data.ambientVolume, language: data.language };
      return { settings };
    })),
    http.get(`${apiBase}/game/saves`, respond(() => ({ slots }))),
    http.put(`${apiBase}/game/saves/:id`, respond(async ({ request, params }) => {
      const slot = slots.find((entry) => entry.id === params.id);
      if (!slot) return fail("Save slot not found.", 404);
      const data = await request.json().catch(() => null);
      if (!exactFields(data, ["chapterTitle", "page"])
        || typeof data.chapterTitle !== "string" || !data.chapterTitle.trim()
        || !Number.isSafeInteger(data.page) || data.page < 1) {
        return fail("Provide a chapter title and a positive integer page.", 400);
      }
      slot.save = { chapterTitle: data.chapterTitle.trim(), page: data.page, savedAt: new Date().toISOString() };
      return { slots };
    })),
    http.post(`${apiBase}/game/saves/:id/load`, respond(({ params }) => {
      const slot = slots.find((entry) => entry.id === params.id);
      if (!slot) return fail("Save slot not found.", 404);
      if (!slot.save) return fail("This save slot is empty.", 409);
      return { page: slot.save.page, chapterTitle: slot.save.chapterTitle };
    })),
  ];
}
