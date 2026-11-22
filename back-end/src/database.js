"use strict";

const mongoose = require("mongoose");
const { characters } = require("../characters/profiles");
const { inventoryCapacity, itemCatalog } = require("./data/items");

function createModels(connection) {
  const { Schema } = mongoose;
  const userSchema = new Schema({
    email: { type: String, required: true, lowercase: true, trim: true, maxlength: 254, unique: true },
    passwordHash: { type: String, required: true, select: false },
    authVersion: { type: Number, default: 0, select: false },
  }, { timestamps: true, versionKey: false });

  const sessionSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    tokenHash: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true, expires: 0 },
  }, { timestamps: { createdAt: true, updatedAt: false }, versionKey: false });

  const resetSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    tokenHash: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true, expires: 0 },
  }, { timestamps: true, versionKey: false });

  const characterProgressSchema = new Schema({
    characterId: { type: String, required: true, enum: Object.keys(characters) },
    unlockedAt: { type: Date, required: true },
    relationshipTier: { type: String, enum: ["reserved", "more_open"], default: "reserved", required: true },
  }, { _id: false });

  const storyUnlockSchema = new Schema({
    factId: { type: String, required: true, match: /^[a-zA-Z0-9_-]+$/, maxlength: 120 },
    unlockedAt: { type: Date, required: true },
  }, { _id: false });

  const inventoryItemSchema = new Schema({
    itemId: { type: String, required: true, enum: itemCatalog.map((item) => item.id) },
    count: { type: Number, required: true, min: 1, validate: Number.isSafeInteger },
    acquiredAt: { type: Date, required: true, default: Date.now },
  }, { _id: false });

  const playerProfileSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    characterProgress: { type: [characterProgressSchema], default: [] },
    storyUnlocks: { type: [storyUnlockSchema], default: [] },
    inventory: {
      type: [inventoryItemSchema],
      default: [],
      validate: {
        validator: (items) => items.length <= inventoryCapacity
          && new Set(items.map((item) => item.itemId)).size === items.length,
        message: "Inventory must fit the backpack and contain one entry per item.",
      },
    },
  }, { timestamps: true, versionKey: false });

  return {
    User: connection.model("User", userSchema, "users"),
    Session: connection.model("Session", sessionSchema, "sessions"),
    PasswordResetToken: connection.model("PasswordResetToken", resetSchema, "passwordResetTokens"),
    PlayerProfile: connection.model("PlayerProfile", playerProfileSchema, "playerProfiles"),
  };
}

async function connectDatabase({ mongodbUri, dbName }) {
  const connection = mongoose.createConnection(mongodbUri, {
    dbName, serverSelectionTimeoutMS: 10000, maxPoolSize: 10, bufferCommands: false,
  });
  try {
    await connection.asPromise();
    const models = createModels(connection);
    // Uniqueness must be enforced before accepting registration requests.
    await Promise.all(Object.values(models).map((model) => model.init()));
    return { connection, models };
  } catch (error) {
    await connection.close().catch(() => {});
    throw error;
  }
}

module.exports = { createModels, connectDatabase };
