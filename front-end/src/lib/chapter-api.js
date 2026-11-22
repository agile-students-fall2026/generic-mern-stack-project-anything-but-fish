const baseUrl = (import.meta.env?.VITE_API_BASE_URL || "/api").replace(/\/+$/, "");
const validId = (value) => Number.isSafeInteger(value) && value > 0;
const validProgress = (value, chapterId) => value?.chapterId === chapterId
  && (value.entryId === null || validId(value.entryId))
  && (value.furthestEntryId === null || validId(value.furthestEntryId))
  && (value.completedAt === null || (typeof value.completedAt === "string" && Number.isFinite(Date.parse(value.completedAt))));

function chapterPath(chapterId) {
  if (typeof chapterId !== "string" || !/^[a-zA-Z0-9_-]+$/.test(chapterId)) {
    throw new Error("Choose a valid chapter.");
  }
  return `${baseUrl}/game/chapters/${encodeURIComponent(chapterId)}`;
}

async function requestChapter(chapterId, action, { body, signal } = {}) {
  const url = `${chapterPath(chapterId)}/${action}`;
  let response;
  try {
    response = await fetch(url, {
      method: body === undefined ? "GET" : "POST",
      credentials: "include", cache: "no-store", signal,
      headers: { Accept: "application/json", ...(body === undefined ? {} : { "Content-Type": "application/json" }) },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
  } catch (error) {
    if (error.name === "AbortError") throw error;
    throw new Error("Unable to save or load your chapter progress. Please try again.");
  }
  let data;
  try { data = await response.json(); }
  catch (error) {
    if (error.name === "AbortError") throw error;
    data = null;
  }
  if (!response.ok) {
    const message = response.status === 401 ? "Please log in to save your chapter progress."
      : typeof data?.detail === "string" && data.detail.trim() ? data.detail
        : "Chapter progress is unavailable. Please try again.";
    throw Object.assign(new Error(message), { status: response.status });
  }
  const progress = action === "complete" ? data?.progress : data;
  if (!validProgress(progress, chapterId)
    || (action === "complete" && (typeof data.alreadyCompleted !== "boolean" || !Array.isArray(data.awardedItems)
      || !data.awardedItems.every((item) => typeof item?.itemId === "string" && validId(item.count))))) {
    throw new Error("The server returned invalid chapter progress. Please try again.");
  }
  return data;
}

export const getChapterProgress = (chapterId, options) => requestChapter(chapterId, "progress", options);

export function saveChapterProgress(chapterId, entryId, options = {}) {
  if (!validId(entryId)) return Promise.reject(new Error("Choose a valid story entry."));
  return requestChapter(chapterId, "progress", { ...options, body: { entryId } });
}

export const completeChapter = (chapterId, options = {}) => requestChapter(chapterId, "complete", { ...options, body: {} });

// The route uses current array order; saved progress identifies the unchanged entry.
export function getEntryPage(entries, entryId) {
  if (entryId === null) return 1;
  const index = entries.findIndex((entry) => entry.id === entryId);
  return index === -1 ? null : index + 1;
}
