import { Router } from "express";

const router = Router();

// Full URL will be GET /api/collections (the prefix is added in app.js)
router.get("/", (req, res) => {
  res.json({
    items: [
      { id: "photo-1", title: "Photo One", description: "Placeholder description." },
      { id: "photo-2", title: "Photo Two", description: "Placeholder description." },
      { id: "photo-3", title: "Photo Three", description: "Placeholder description." },
    ],
  });
});

export default router;