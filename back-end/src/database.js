"use strict";

const mongoose = require("mongoose");

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

  return {
    User: connection.model("User", userSchema, "users"),
    Session: connection.model("Session", sessionSchema, "sessions"),
    PasswordResetToken: connection.model("PasswordResetToken", resetSchema, "passwordResetTokens"),
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
