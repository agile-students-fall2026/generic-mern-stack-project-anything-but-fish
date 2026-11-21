"use strict";

const express = require("express");
const { rateLimit } = require("express-rate-limit");
const { body, validationResult } = require("express-validator");
const { dummyPasswordHash, hashPassword, verifyPassword, hashToken, issueSession, readSession } = require("../security");

class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

const publicUser = (user) => ({ id: user.id, email: user.email });
const emailField = () => body("email").isString().withMessage("Enter a valid email address.").bail()
  .trim().isLength({ max: 254 }).isEmail().withMessage("Enter a valid email address.").bail()
  .customSanitizer((email) => email.toLowerCase());
const passwordField = (min = 8) => body("password").isString().withMessage("Enter a valid password.").bail()
  .custom((password) => password.length >= min && password.length <= 128)
  .withMessage(min === 8 ? "Password must be 8–128 characters." : "Enter a password of at most 128 characters.");

function validate(req, _res, next) {
  const result = validationResult(req);
  if (!result.isEmpty()) return next(new HttpError(400, result.array()[0].msg));
  next();
}

async function readAccount(req, { config, models }) {
  if (!models) return null;
  const claims = readSession(req.cookies?.[config.cookieName], config);
  if (!claims) return null;
  const session = await models.Session.findOne({
    userId: claims.sub, tokenHash: hashToken(claims.jti), expiresAt: { $gt: new Date() },
  });
  const user = session && await models.User.findById(claims.sub).select("+authVersion");
  return user && user.authVersion === claims.v ? user : null;
}

function createAuthRouter({ config, models }) {
  const { User, Session, PasswordResetToken } = models;
  const router = express.Router();
  router.use((req, _res, next) => {
    if (req.method === "POST" && !req.is("application/json")) {
      return next(new HttpError(415, "Send requests as application/json."));
    }
    next();
  });
  router.use(express.json({ limit: "16kb" }));

  const cookieOptions = { httpOnly: true, secure: config.secureCookies, sameSite: config.sameSite, path: "/" };
  const clearCookie = (res) => res.clearCookie(config.cookieName, cookieOptions);
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, limit: config.authRateLimit,
    standardHeaders: "draft-8", legacyHeaders: false,
    message: { detail: "Too many authentication attempts. Please try again later." },
  });

  router.post("/register", limiter, emailField(), passwordField(), validate, async (req, res) => {
    const passwordHash = await hashPassword(req.body.password);
    try { await User.create({ email: req.body.email, passwordHash }); }
    catch (error) {
      if (error.code === 11000) throw new HttpError(409, "An account with this email already exists.");
      throw error;
    }
    res.status(201).json({ message: "Your account is ready. Log in to continue." });
  });

  router.post("/login", limiter, emailField(), passwordField(1), validate, async (req, res) => {
    const user = await User.findOne({ email: req.body.email }).select("+passwordHash +authVersion");
    const matches = await verifyPassword(req.body.password, user?.passwordHash || dummyPasswordHash);
    if (!user || !matches) throw new HttpError(401, "Email or password is incorrect.");
    const session = issueSession(user, config);
    await Session.create({ userId: user._id, tokenHash: session.tokenHash, expiresAt: session.expiresAt });
    res.cookie(config.cookieName, session.token, { ...cookieOptions, maxAge: config.sessionTtlSeconds * 1000 });
    res.json({ user: publicUser(user) });
  });

  router.get("/me", async (req, res) => {
    const user = await readAccount(req, { config, models });
    if (!user) { clearCookie(res); throw new HttpError(401, "Please log in to continue."); }
    res.json({ user: publicUser(user) });
  });

  router.post("/logout", async (req, res) => {
    const claims = readSession(req.cookies[config.cookieName], config);
    if (claims) await Session.deleteOne({ userId: claims.sub, tokenHash: hashToken(claims.jti) });
    clearCookie(res);
    res.status(204).end();
  });

  router.post("/forgot-password", limiter, emailField(), validate, (_req, _res) => {
    throw new HttpError(503, "Password recovery is currently unavailable.");
  });

  router.post("/reset-password", limiter,
    body("token").isString().bail().matches(/^[a-f0-9]{64}$/).withMessage("This reset link is invalid or expired."),
    passwordField(), validate, async (req, res) => {
      const passwordHash = await hashPassword(req.body.password);
      await User.db.transaction(async (session) => {
        const reset = await PasswordResetToken.findOneAndDelete({
          tokenHash: hashToken(req.body.token), expiresAt: { $gt: new Date() },
        }).session(session);
        if (!reset) throw new HttpError(400, "This reset link is invalid or expired.");
        const user = await User.findByIdAndUpdate(reset.userId, {
          $set: { passwordHash }, $inc: { authVersion: 1 },
        }, { session });
        if (!user) throw new HttpError(400, "This reset link is invalid or expired.");
        await Session.deleteMany({ userId: reset.userId }).session(session);
      });
      clearCookie(res);
      res.json({ message: "Your password has been reset. Log in with your new password." });
    });

  return router;
}

module.exports = { createAuthRouter, readAccount, HttpError };
