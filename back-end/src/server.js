"use strict";

const path = require("node:path");
require("dotenv").config({ path: path.join(__dirname, "../.env"), quiet: true });
const { readConfig } = require("./config");
const { connectDatabase } = require("./database");
const { createApp } = require("./app");

let database;

async function start() {
  const config = readConfig(process.env, { requireDatabase: process.env.NODE_ENV === "production" });
  if (config.authEnabled) database = await connectDatabase(config);
  const app = createApp({ config, models: database?.models });
  const server = app.listen(config.port, () => {
    console.log(`API listening on port ${config.port}; ${database ? "MongoDB connected" : "authentication unavailable (MongoDB not configured)"}.`);
  });
  server.on("error", async (error) => {
    console.error(`API server could not listen (${error.code || error.name}).`);
    if (database) await database.connection.close();
    process.exitCode = 1;
  });
  for (const signal of ["SIGINT", "SIGTERM"]) {
    process.once(signal, () => {
      server.close(async () => {
        if (database) await database.connection.close();
        process.exit(0);
      });
    });
  }
}

start().catch(async (error) => {
  // Database driver messages can contain credentials; only configuration errors are printed in full.
  console.error(error.name === "Error" ? error.message : `MongoDB startup failed (${error.name}). Check credentials and Atlas network access.`);
  if (database) await database.connection.close();
  process.exitCode = 1;
});
