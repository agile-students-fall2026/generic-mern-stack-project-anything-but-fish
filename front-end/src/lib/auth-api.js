const baseUrl = (import.meta.env.VITE_API_BASE_URL || "/api").replace(/\/$/, "");

export async function authRequest(path, { body, signal } = {}) {
  let response;
  try {
    response = await fetch(`${baseUrl}/auth${path}`, {
      method: body === undefined ? "GET" : "POST",
      credentials: "include",
      headers: body === undefined ? { Accept: "application/json" } : { Accept: "application/json", "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    });
  } catch (error) {
    if (error.name === "AbortError") throw error;
    throw new Error("Unable to reach the server. Please try again.");
  }
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const error = new Error(typeof data?.detail === "string" ? data.detail : "The request failed. Please try again.");
    error.status = response.status;
    throw error;
  }
  if (!data && response.status !== 204) throw new Error("The server returned an invalid response.");
  return data;
}

export function readUser(data) {
  if (!data?.user?.id || typeof data.user.email !== "string") {
    throw new Error("The server returned an invalid account response.");
  }
  return data.user;
}
