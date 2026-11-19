import express from "express";
import collectionsRouter from "./routes/collections.js";

const app = express();
app.use(express.json());

app.use("/api/game/collections", collectionsRouter);

// Must stay after all routes: it catches anything that didn't match above.
app.use((req, res) => {
  res.status(404).json({ detail: "Not found" });
});

export default app;