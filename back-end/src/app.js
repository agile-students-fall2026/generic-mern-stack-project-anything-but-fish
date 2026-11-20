"use strict";

const express = require("express");
const collectionsRouter = require("./routes/collections");
const chatRouter = require("./routes/chat");


const app = express();

app.use("/api/game/collections", collectionsRouter);
app.use("/api/game/chat", chatRouter);


// Must stay after all routes: catches anything that didn't match above.
app.use((req, res) => {
  res.status(404).json({ detail: "Not found" });
});

module.exports = app;