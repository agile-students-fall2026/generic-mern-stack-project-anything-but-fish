import { http, HttpResponse } from "msw/http";
import { delay } from "msw/utils/delay";
import { chapterPreview, chapterCharacters, chapterCollection, initialChapterProgress } from "./fixtures/chapter.js";
import { inventoryPreview } from "./fixtures/inventory.js";
import { saveSlotsPreview } from "./fixtures/saves.js";

const exactFields = (data, fields) => data && typeof data === "object" && !Array.isArray(data)
  && Object.keys(data).length === fields.length && fields.every((field) => Object.hasOwn(data, field));

export function createGameHandlers({ baseUrl = "/api", scenario = "demo", delayMs = 250, mockProgress = false } = {}) {
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
  const progress = { ...initialChapterProgress };
  const unlockedCharacters = new Set(scenario === "empty" ? [] : ["cislo"]);
  const inventoryItems = [];
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

  const characterList = () => chapterCharacters.filter((character) => unlockedCharacters.has(character.name));
  const plots = () => ({ categories: [
    { id: "characters", title: "Characters", entries: characterList().map((character) => ({
      id: character.name, title: character.displayName, total: 1, collected: 1, description: [character.description],
    })) },
    { id: "chapters", title: "Chapters", entries: progress.completedAt ? [{
      id: chapterPreview.id, title: chapterPreview.title, total: 1, collected: 1, description: [chapterCollection.description],
    }] : [] },
    { id: "objects", title: "Objects", entries: inventoryItems.map((item) => ({
      id: item.id, title: item.name, total: 1, collected: 1, description: [item.description],
    })) },
  ] });

  // Only the standalone demo intercepts implemented account-progress APIs.
  // Auth and NPC chat always retain their real network behavior.
  return [
    ...(mockProgress ? [
      http.get(`${apiBase}/game/plots`, respond(plots)),
      http.get(`${apiBase}/game/characters`, respond(() => ({
        characters: characterList().map(({ name, displayName }) => ({ name, displayName })),
      }))),
      http.get(`${apiBase}/game/collections`, respond(() => ({ items: progress.completedAt ? [chapterCollection] : [] }))),
      http.get(`${apiBase}/game/inventory`, respond(() => ({ capacity: inventoryPreview.capacity, items: inventoryItems }))),
      http.get(`${apiBase}/game/chapters/:chapterId/progress`, respond(({ params }) => (
        params.chapterId === chapterPreview.id ? { ...progress } : fail("Chapter not found.", 404)
      ))),
      http.post(`${apiBase}/game/chapters/:chapterId/progress`, respond(async ({ params, request }) => {
        if (params.chapterId !== chapterPreview.id) return fail("Chapter not found.", 404);
        const data = await request.json().catch(() => null);
        if (!exactFields(data, ["entryId"]) || !Number.isSafeInteger(data.entryId)) {
          return fail("Provide a numeric entryId.", 400);
        }
        const index = chapterPreview.entryIds.indexOf(data.entryId);
        if (index === -1) return fail("Story entry not found.", 400);
        const furthestIndex = chapterPreview.entryIds.indexOf(progress.furthestEntryId);
        if (index > furthestIndex + 1) return fail("Continue from your saved progress before skipping ahead.", 409);
        progress.entryId = data.entryId;
        if (index > furthestIndex) progress.furthestEntryId = data.entryId;
        for (const unlock of chapterPreview.characterUnlocks) {
          if (unlock.entryId === data.entryId) unlockedCharacters.add(unlock.characterId);
        }
        return { ...progress };
      })),
      http.post(`${apiBase}/game/chapters/:chapterId/complete`, respond(async ({ params, request }) => {
        if (params.chapterId !== chapterPreview.id) return fail("Chapter not found.", 404);
        const data = await request.json().catch(() => null);
        if (!exactFields(data, [])) return fail("Send an empty JSON object to complete the chapter.", 400);
        if (progress.furthestEntryId !== chapterPreview.entryIds.at(-1)) {
          return fail("Read to the end of the chapter first.", 409);
        }
        const alreadyCompleted = Boolean(progress.completedAt);
        if (!alreadyCompleted) {
          progress.completedAt = new Date().toISOString();
          inventoryItems.push(structuredClone(inventoryPreview.items[0]));
          for (const unlock of chapterPreview.characterUnlocks) unlockedCharacters.add(unlock.characterId);
        }
        return {
          progress: { ...progress }, alreadyCompleted,
          awardedItems: alreadyCompleted ? [] : [{ itemId: "ancient-coin", count: 1 }],
        };
      })),
    ] : []),
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
