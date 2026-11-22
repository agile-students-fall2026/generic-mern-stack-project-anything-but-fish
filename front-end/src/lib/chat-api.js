const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || "/api")
  .replace(/\/+$/, "");

function getCharacterUrl(characterId) {
  if (
    typeof characterId !== "string" ||
    !/^[a-zA-Z0-9_-]+$/.test(characterId)
  ) {
    throw new Error("Invalid character.");
  }

  return `${apiBaseUrl}/game/chat/${encodeURIComponent(characterId)}`;
}

async function requestChat(url, { method = "GET", body, signal } = {}) {
  let response;

  try {
    response = await fetch(url, {
      method,
      credentials: "include",
      cache: "no-store",
      signal,
      headers: {
        Accept: "application/json",
        ...(body === undefined
          ? {}
          : { "Content-Type": "application/json" }),
      },
      ...(body === undefined
        ? {}
        : { body: JSON.stringify(body) }),
    });
  } catch (error) {
    if (error.name === "AbortError") throw error;
    throw new Error("Unable to reach the chat server. Please try again.");
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      typeof data?.detail === "string" && data.detail.trim()
        ? data.detail
        : "The chat request failed. Please try again.";

    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error("The chat server returned an invalid response.");
  }

  return data;
}

export async function getChatHistory(characterId, { signal } = {}) {
  const data = await requestChat(getCharacterUrl(characterId), { signal });

  if (
    !Array.isArray(data.messages) ||
    !data.messages.every(
      (item) =>
        item &&
        typeof item === "object" &&
        (item.role === "user" || item.role === "assistant") &&
        typeof item.content === "string"
    )
  ) {
    throw new Error("The chat server returned invalid messages.");
  }

  return data.messages;
}

export async function sendChatMessage(characterId, message, { signal } = {}) {
  const content = typeof message === "string" ? message.trim() : "";

  if (!content || content.length > 2000) {
    throw new Error("Enter a message between 1 and 2000 characters.");
  }

  const data = await requestChat(getCharacterUrl(characterId), {
    method: "POST",
    body: { message: content },
    signal,
  });

  if (typeof data.reply !== "string" || !data.reply.trim()) {
    throw new Error("The chat server returned an invalid reply.");
  }

  return data.reply;
}
