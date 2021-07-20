#!/usr/bin/env node

const dotenv = require("dotenv");
const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");

dotenv.config();

const check = require("./commands/check");
const invite = require("./commands/invite");
const list = require("./commands/list");

yargs(hideBin(process.argv))
  .demandCommand()
  .command(
    "check [tournamentId]",
    "Check existing tournament teams.",
    (yargs) => yargs.positional("tournamentId", {}),
    check
  )
  .option("tournamentId", {
    type: "string",
    description: "Tournament ID.",
    demandOption: true,
  })
  .command(
    "list [tournamentId]",
    "List existing tournament teams.",
    (yargs) => yargs.positional("tournamentId", {}),
    list
  )
  .option("tournamentId", {
    type: "string",
    description: "Tournament ID.",
    demandOption: true,
  })
  .option("excluded", {
    alias: "x",
    type: "boolean",
    description: "List only excluded teams.",
    default: false,
  })
  .option("new", {
    alias: "n",
    type: "boolean",
    description: "List only new teams.",
    default: false,
  })
  .command(
    "invite [tournamentId]",
    "Send invitations to team leaders for the next tournament.",
    (yargs) => yargs.positional("tournamentId", {}),
    invite
  )
  .option("tournamentId", {
    type: "string",
    description: "Tournament ID.",
    demandOption: true,
  }).argv;
