import express from "express";
import collectionsRouter from "./routes/collections.js"

const app = express();
app.use(express.json()); 


app.use("/api/game/collections", collectionsRouter);
app.get("/api/collections", (req, res) => {
  res.json({
    items: [
      { id: "photo-1", title: "Photo One", description: "Placeholder description." },
      { id: "photo-2", title: "Photo Two", description: "Placeholder description." },
      { id: "photo-3", title: "Photo Three", description: "Placeholder description." },
    ],
  });
});

export default app;