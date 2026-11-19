import { Router } from "express";
import { collectionItems } from "../data/collections.js";

const router = Router();

// Full URL: GET /api/game/collections (prefix is added in app.js)
router.get("/", (req, res) => {
  res.json({ items: collectionItems });
});

export default router;