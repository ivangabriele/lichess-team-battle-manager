#!/usr/bin/env node

const dotenv = require('dotenv')
const path = require('path')
const yargs = require('yargs')

dotenv.config({ path: path.resolve(__dirname, '../.env') })

const check = require('./commands/check')
const clean = require('./commands/clean')
const invite = require('./commands/invite')
const list = require('./commands/list')
const suggest = require('./commands/suggest')

yargs.command(
  'check [tournamentId]',
  'Check registered teams for the provided tournament ID.',
  _yargs =>
    _yargs.positional('tournamentId', {}).option('tournamentId', {
      demandOption: true,
      description: 'Tournament ID.',
      type: 'string',
    }),
  check,
)

yargs.command(
  'clean [tournamentId]',
  'Suggest a new teams list without excluding inactive ones for the provided tournament ID.',
  _yargs =>
    _yargs.positional('tournamentId', {}).option('tournamentId', {
      demandOption: true,
      description: 'Tournament ID.',
      type: 'string',
    }),
  clean,
)

yargs.command(
  'invite [tournamentId]',
  'Send invitations to team leaders for the provided tournament.',
  _yargs =>
    _yargs
      .positional('tournamentId', {})
      .option('tournamentId', {
        demandOption: true,
        description: 'Tournament ID.',
        type: 'string',
      })
      .option('new', {
        alias: 'N',
        default: false,
        description: `Send invitations to lead teams' leaders.`,
        type: 'boolean',
      }),
  invite,
)

yargs.command(
  'list [tournamentId]',
  'List teams.',
  _yargs =>
    _yargs
      .positional('tournamentId', {})
      .option('tournamentId', {
        demandOption: true,
        description: 'Tournament ID.',
        type: 'string',
      })
      .option('excluded', {
        alias: 'X',
        default: false,
        description: 'List excluded teams (from the Teams Sheet).',
        type: 'boolean',
      })
      .option('new', {
        alias: 'N',
        default: false,
        description:
          `Copy new teams added to the provided tournament in TSV format ` +
          `in order to paste them in the Teams Sheet.`,
        type: 'boolean',
      }),
  list,
)

yargs.command(
  'suggest',
  'Suggest potential team leaders to contact for new teams (Teams Sheet).',
  _yargs =>
    _yargs.option('blacklist', {
      alias: 'B',
      default: false,
      description: 'Suggest leaders to blacklist for not replying.',
      type: 'boolean',
    }),
  suggest,
)

// eslint-disable-next-line no-unused-expressions
yargs.demandCommand().argv
