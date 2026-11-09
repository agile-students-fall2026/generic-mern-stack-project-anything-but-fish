import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./assets/fonts/chakra-petch/font.css";

async function preparePreview() {
  if (import.meta.env.VITE_ENABLE_MOCKS !== "false"
    && (import.meta.env.DEV || import.meta.env.MODE === "demo" || import.meta.env.VITE_ENABLE_MOCKS === "true")) {
    const { startGameMocks } = await import("./mocks/browser.js");
    await startGameMocks();
  }
}

// Wait for request interception before mounting pages that fetch their data.
preparePreview()
  .catch((error) => {
    console.error("Game preview mocking could not start. Requests will use the configured API.", error);
  })
  .then(() => {
    createRoot(document.getElementById("root")).render(
      <StrictMode>
        <App />
      </StrictMode>,
    );
  });
