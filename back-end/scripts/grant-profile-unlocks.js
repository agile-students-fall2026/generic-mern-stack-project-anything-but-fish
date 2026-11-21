"use strict";

const path = require("node:path");
const { parseArgs } = require("node:util");
const { characters } = require("../characters/profiles");
const { storyFacts } = require("../src/data/storyFacts");
const { connectDatabase } = require("../src/database");
const {
  validateUnlocks,
  grantProfileUnlocks,
  listUnlockedCharacters,
  getUnlockedFactIds,
} = require("../src/services/playerProfiles");

const usage = `Usage:
  npm run profile:grant -- --list
  npm run profile:grant -- --email player@example.com --db-name DATABASE --characters ona,ivan --facts FACT_ID

The default prints an offline plan without connecting to MongoDB.
Add --apply to grant the listed unlocks to an existing account in that database.
MONGODB_URI is read from the environment or back-end/.env. Existing unlocks are kept.
Characters and facts are optional; with neither, --apply creates only the default Cislo profile.`;

function commaList(value) {
  return value === undefined || value === "" ? [] : value.split(",").map((entry) => entry.trim());
}

async function main(args = process.argv.slice(2)) {
  let values;
  try {
    ({ values } = parseArgs({
      args,
      options: {
        email: { type: "string" },
        "db-name": { type: "string" },
        characters: { type: "string" },
        facts: { type: "string" },
        apply: { type: "boolean", default: false },
        list: { type: "boolean", default: false },
        help: { type: "boolean", default: false },
      },
    }));
  } catch {
    throw new Error("Invalid command options. Run with --help.");
  }

  if (values.help) {
    console.log(usage);
    return;
  }
  if (values.list) {
    console.log(JSON.stringify({
      characters: Object.values(characters).map(({ id, displayName }) => ({ id, displayName })),
      facts: storyFacts.map(({ id, title, characterIds }) => ({ id, title, characterIds })),
    }, null, 2));
    return;
  }

  const email = values.email?.trim().toLowerCase();
  const dbName = values["db-name"];
  if (!email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Provide the existing test account's email with --email.");
  }
  if (!dbName || !/^[A-Za-z0-9_-]+$/.test(dbName)) {
    throw new Error("Provide the exact target database name with --db-name.");
  }
  const unlocks = validateUnlocks({
    characterIds: commaList(values.characters),
    factIds: commaList(values.facts),
  });

  if (!values.apply) {
    console.log(JSON.stringify({ action: "dry-run", database: dbName, email, defaultCharacter: "cislo", ...unlocks }, null, 2));
    console.log("No database connection or writes were made. Add --apply after reviewing the target and unlocks.");
    return;
  }

  require("dotenv").config({ path: path.join(__dirname, "../.env"), quiet: true });
  const mongodbUri = process.env.MONGODB_URI;
  if (!/^mongodb(?:\+srv)?:\/\//.test(mongodbUri || "") || /<[^>]+>/.test(mongodbUri)) {
    throw new Error("Set MONGODB_URI to a complete MongoDB connection string before applying grants.");
  }

  let database;
  try {
    database = await connectDatabase({ mongodbUri, dbName });
    const user = await database.models.User.findOne({ email }).select("_id").lean();
    if (!user) throw new Error("The specified account does not exist in the target database; no profile was granted.");
    const profile = await grantProfileUnlocks(database.models, user._id, unlocks);
    console.log(JSON.stringify({
      action: "applied",
      database: dbName,
      email,
      characters: listUnlockedCharacters(profile).map(({ name }) => name),
      factIds: getUnlockedFactIds(profile),
    }, null, 2));
  } catch (error) {
    if (error.message === "The specified account does not exist in the target database; no profile was granted.") throw error;
    // Driver errors may contain connection credentials; do not print their messages.
    throw new Error("Could not apply profile unlocks. Check database connectivity and permissions, then retry the same command.");
  } finally {
    if (database) {
      await database.connection.close().catch(() => {
        throw new Error("Could not close the database connection cleanly.");
      });
    }
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}

module.exports = { main };
