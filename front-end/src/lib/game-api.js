const baseUrl = (import.meta.env?.VITE_API_BASE_URL || "/api").replace(/\/$/, "");

const text = (value) => typeof value === "string";
const id = (value) => text(value) && /^[a-zA-Z0-9_-]+$/.test(value);
const list = (value, validate) => Array.isArray(value) && value.every(validate);
const nonemptyText = (value) => text(value) && value.trim().length > 0;
const volume = (value) => Number.isInteger(value) && value >= 0 && value <= 100;
const settingsValid = (value) => volume(value?.soundVolume) && volume(value.ambientVolume) && ["en", "zh"].includes(value.language);
const positionValid = (value) => nonemptyText(value?.chapterTitle) && Number.isSafeInteger(value.page) && value.page > 0;
const icons = new Set(["coin", "key", "notebook", "tape", "photograph"]);
const validators = {
  plots: (data) => list(data?.categories, (category) => id(category?.id) && text(category.title)
    && list(category.entries, (entry) => id(entry?.id) && text(entry.title)
      && Number.isSafeInteger(entry.total) && entry.total >= 0
      && Number.isSafeInteger(entry.collected) && entry.collected >= 0 && entry.collected <= entry.total
      && list(entry.description, text))),
  collections: (data) => list(data?.items, (item) => id(item?.id) && text(item.title) && text(item.description)),
  characters: (data) => list(data?.characters, (character) => id(character?.name) && text(character.displayName)),
  inventory: (data) => Number.isSafeInteger(data?.capacity) && data.capacity > 0
    && list(data.items, (item) => id(item?.id) && nonemptyText(item.name) && nonemptyText(item.type)
      && Number.isSafeInteger(item.count) && item.count > 0 && text(item.description) && icons.has(item.icon))
    && data.items.length <= data.capacity,
  settings: (data) => settingsValid(data?.settings),
  saves: (data) => list(data?.slots, (slot) => id(slot?.id) && (slot.save === null
    || (positionValid(slot.save) && text(slot.save.savedAt) && /^\d{4}-\d{2}-\d{2}T/.test(slot.save.savedAt)
      && Number.isFinite(Date.parse(slot.save.savedAt))))),
};

async function requestGame(path, validate, { signal, method = "GET", body, action = "load this page", slotRequest = false } = {}) {
  const failureMessage = `Unable to ${action}. Please try again.`;
  let response;
  try {
    response = await fetch(`${baseUrl}/game/${path}`, {
      method,
      headers: { Accept: "application/json", ...(body !== undefined ? { "Content-Type": "application/json" } : {}) },
      credentials: "include",
      cache: "no-store",
      signal,
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });
  } catch (error) {
    if (error.name === "AbortError") throw error;
    throw new Error(failureMessage);
  }
  if (!response.ok) {
    let message = failureMessage;
    if (slotRequest && response.status === 409) message = "This save slot is empty. Choose another slot.";
    if (slotRequest && response.status === 404) message = "This save slot could not be found. Please try another slot.";
    if (response.status === 400) message = "Some values are invalid. Please check them and try again.";
    throw Object.assign(new Error(message), { status: response.status });
  }
  let data;
  try { data = await response.json(); }
  catch (error) {
    if (error.name === "AbortError") throw error;
    data = null;
  }
  // A static host may return index.html with status 200 when an API is missing.
  if (!validate(data)) throw new Error("The server returned an invalid response. Please try again.");
  return data;
}

export function gameRequest(resource, options = {}) {
  const validate = validators[resource];
  if (!validate) return Promise.reject(new Error("Unknown game resource."));
  return requestGame(resource, validate, options);
}

function slotPath(slotId) {
  if (!id(slotId)) throw new Error("Choose a valid save slot.");
  return `saves/${encodeURIComponent(slotId)}`;
}

export async function saveGame(slotId, payload, { signal } = {}) {
  return requestGame(slotPath(slotId), validators.saves, {
    signal, method: "PUT", body: payload, action: "save your progress", slotRequest: true,
  });
}

export async function loadGame(slotId, { signal } = {}) {
  return requestGame(`${slotPath(slotId)}/load`, positionValid, {
    signal, method: "POST", action: "load your save", slotRequest: true,
  });
}

export async function updateSettings(payload, { signal } = {}) {
  return requestGame("settings", validators.settings, {
    signal, method: "PATCH", body: payload, action: "update your settings",
  });
}
