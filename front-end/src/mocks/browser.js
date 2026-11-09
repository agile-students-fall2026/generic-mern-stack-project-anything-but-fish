import { setupWorker } from "msw/browser";
import { createGameHandlers } from "./handlers.js";

export async function startGameMocks() {
  const baseUrl = new URL(import.meta.env.VITE_API_BASE_URL || "/api", window.location.href).href.replace(/\/$/, "");
  const worker = setupWorker(...createGameHandlers({
    baseUrl,
    scenario: import.meta.env.VITE_MOCK_SCENARIO || "demo",
    delayMs: Number(import.meta.env.VITE_MOCK_DELAY_MS ?? 250),
  }));

  await worker.start({
    serviceWorker: { url: `${import.meta.env.BASE_URL}mockServiceWorker.js` },
    // Auth, assets and every other API retain their actual network behavior.
    onUnhandledFrame: "bypass",
    quiet: true,
  });
}
