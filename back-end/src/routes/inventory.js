"use strict";

const { Router } = require("express");
const { inventoryCapacity, itemCatalog } = require("../data/items");

const router = Router();

router.get("/", (_req, res) => {
  // Older profiles have no inventory field and start with an empty backpack.
  const ownedItems = res.locals.playerProfile.inventory || [];
  const items = ownedItems.flatMap(({ itemId, count }) => {
    const item = itemCatalog.find((entry) => entry.id === itemId);
    return item && Number.isSafeInteger(count) && count > 0 ? [{ ...item, count }] : [];
  });
  res.json({ capacity: inventoryCapacity, items });
});

module.exports = router;
