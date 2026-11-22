"use strict";

const express = require("express");
const { HttpError } = require("./auth");

function gameBody(fields) {
  return [
    (req, _res, next) => {
      if (!req.is("application/json")) throw new HttpError(415, "Send requests as application/json.");
      next();
    },
    express.json({ limit: "4kb" }),
    (req, _res, next) => {
      const data = req.body;
      if (!data || typeof data !== "object" || Array.isArray(data)
        || Object.keys(data).length !== fields.length || !fields.every((field) => Object.hasOwn(data, field))) {
        throw new HttpError(400, fields.length ? `Provide only ${fields.join(" and ")}.` : "Send an empty JSON object.");
      }
      if (fields.includes("chapterId") && (typeof data.chapterId !== "string" || !/^[a-zA-Z0-9_-]+$/.test(data.chapterId))) {
        throw new HttpError(400, "Provide a valid chapter ID.");
      }
      next();
    },
  ];
}

module.exports = { gameBody };
