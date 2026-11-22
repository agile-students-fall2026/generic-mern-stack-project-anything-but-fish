"use strict";

const { inventoryCapacity, itemCatalog } = require("../data/items");
const { HttpError } = require("../routes/auth");

function inventoryFor(profile) {
  const items = (profile.inventory || []).flatMap(({ itemId, count }) => {
    const item = itemCatalog.find((entry) => entry.id === itemId);
    return item && Number.isSafeInteger(count) && count > 0 ? [{ ...item, count }] : [];
  });
  return { capacity: inventoryCapacity, items };
}

// Called only with server-owned reward definitions, inside updatePlayerProfile.
function applyItemReward(profile, rewardId, rewards, acquiredAt = new Date()) {
  if (profile.rewardClaims.some((claim) => claim.rewardId === rewardId)) return [];
  for (const { itemId, count } of rewards) {
    if (!itemCatalog.some((item) => item.id === itemId) || !Number.isSafeInteger(count) || count < 1) {
      throw new Error("Invalid inventory reward configuration.");
    }
    const owned = profile.inventory.find((item) => item.itemId === itemId);
    if (owned) {
      if (!Number.isSafeInteger(owned.count + count)) throw new HttpError(409, "This item stack is full.");
      owned.count += count;
    } else {
      if (profile.inventory.length >= inventoryCapacity) throw new HttpError(409, "Your inventory is full.");
      profile.inventory.push({ itemId, count, acquiredAt });
    }
  }
  profile.rewardClaims.push({ rewardId, claimedAt: acquiredAt });
  return rewards.map(({ itemId, count }) => ({ itemId, count }));
}

module.exports = { inventoryFor, applyItemReward };
