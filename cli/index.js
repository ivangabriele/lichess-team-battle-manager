#!/usr/bin/env node

const dotenv = require("dotenv");
const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");

dotenv.config();

const check = require("./commands/check");
const invite = require("./commands/invite");
const list = require("./commands/list");
const suggest = require("./commands/suggest");

yargs(hideBin(process.argv))
  .demandCommand()
  .command(
    "check [tournamentId]",
    "Check registered teams for the provided tournament ID.",
    (yargs) => yargs.positional("tournamentId", {}),
    check
  )
  .option("tournamentId", {
    type: "string",
    description: "Tournament ID.",
  })
  .command(
    "list [tournamentId]",
    "List teams.",
    (yargs) => yargs.positional("tournamentId", {}),
    list
  )
  .option("tournamentId", {
    type: "string",
    description: "Tournament ID.",
  })
  .option("excluded", {
    alias: "x",
    type: "boolean",
    description: "List excluded teams (from the Teams Sheet).",
    default: false,
  })
  .option("new", {
    alias: "n",
    type: "boolean",
    description:
      `Copy new teams added to the provided tournament in TSV format ` +
      `in order to paste them in the Teams Sheet.`,
    default: false,
  })
  .command(
    "invite [tournamentId]",
    "Send invitations to team leaders for the provided tournament.",
    (yargs) => yargs.positional("tournamentId", {}),
    invite
  )
  .option("tournamentId", {
    type: "string",
    description: "Tournament ID.",
  })
  .command(
    "suggest",
    "Suggest potential team leaders to contact for new teams (Teams Sheet).",
    suggest
  ).argv;
