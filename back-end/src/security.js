"use strict";

const { randomBytes, scrypt: scryptCallback, timingSafeEqual, createHash } = require("node:crypto");
const { promisify } = require("node:util");
const jwt = require("jsonwebtoken");

const scrypt = promisify(scryptCallback);
const parameters = { N: 32768, r: 8, p: 3, maxmem: 64 * 1024 * 1024 };
// Missing accounts still run the same password derivation as existing accounts.
const dummyPasswordHash = `scrypt$${"00".repeat(16)}$${"00".repeat(64)}`;

async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = await scrypt(password, salt, 64, parameters);
  return `scrypt$${salt}$${hash.toString("hex")}`;
}

async function verifyPassword(password, storedHash) {
  if (typeof storedHash !== "string" || !/^scrypt\$[a-f0-9]{32}\$[a-f0-9]{128}$/.test(storedHash)) return false;
  const [, salt, expected] = storedHash.split("$");
  const actual = await scrypt(password, salt, 64, parameters);
  return timingSafeEqual(actual, Buffer.from(expected, "hex"));
}

const randomToken = () => randomBytes(32).toString("hex");
const hashToken = (token) => createHash("sha256").update(token).digest("hex");

function issueSession(user, config) {
  const sessionId = randomToken();
  const token = jwt.sign({ v: user.authVersion }, config.jwtSecret, {
    algorithm: "HS256", subject: user.id, jwtid: sessionId,
    issuer: "anything-but-fish-api", audience: "anything-but-fish",
    expiresIn: config.sessionTtlSeconds,
  });
  const { exp } = jwt.decode(token);
  return { token, tokenHash: hashToken(sessionId), expiresAt: new Date(exp * 1000) };
}

function readSession(token, config) {
  if (typeof token !== "string" || token.length > 4096) return null;
  try {
    const claims = jwt.verify(token, config.jwtSecret, {
      algorithms: ["HS256"], issuer: "anything-but-fish-api", audience: "anything-but-fish",
    });
    if (!/^[a-f0-9]{24}$/.test(claims.sub) || !/^[a-f0-9]{64}$/.test(claims.jti) ||
        !Number.isSafeInteger(claims.v) || !Number.isSafeInteger(claims.exp)) return null;
    return claims;
  } catch { return null; }
}

module.exports = { dummyPasswordHash, hashPassword, verifyPassword, randomToken, hashToken, issueSession, readSession };
