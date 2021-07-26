#!/usr/bin/env node

const dotenv = require("dotenv");
const yargs = require("yargs");

dotenv.config();

const check = require("./commands/check");
const invite = require("./commands/invite");
const list = require("./commands/list");
const suggest = require("./commands/suggest");

yargs.command(
  "check [tournamentId]",
  "Check registered teams for the provided tournament ID.",
  (yargs) =>
    yargs.positional("tournamentId", {}).option("tournamentId", {
      type: "string",
      description: "Tournament ID.",
      demandOption: true,
    }),
  check
);

yargs.command(
  "list [tournamentId]",
  "List teams.",
  (yargs) =>
    yargs
      .positional("tournamentId", {})
      .option("tournamentId", {
        type: "string",
        description: "Tournament ID.",
        demandOption: true,
      })
      .option("excluded", {
        alias: "X",
        type: "boolean",
        description: "List excluded teams (from the Teams Sheet).",
        default: false,
      })
      .option("new", {
        alias: "N",
        type: "boolean",
        description:
          `Copy new teams added to the provided tournament in TSV format ` +
          `in order to paste them in the Teams Sheet.`,
        default: false,
      }),
  list
);

yargs.command(
  "invite [tournamentId]",
  "Send invitations to team leaders for the provided tournament.",
  (yargs) =>
    yargs
      .positional("tournamentId", {})
      .option("tournamentId", {
        type: "string",
        description: "Tournament ID.",
        demandOption: true,
      })
      .option("new", {
        alias: "N",
        type: "boolean",
        description: `Send invitations to lead teams' leaders.`,
        default: false,
      }),
  invite
);

yargs.command(
  "suggest",
  "Suggest potential team leaders to contact for new teams (Teams Sheet).",
  (yargs) =>
    yargs.option("blacklist", {
      alias: "B",
      type: "boolean",
      description: "Suggest leaders to blacklist for not replying.",
      default: false,
    }),
  suggest
);

yargs.demandCommand().argv;
