const axios = require("axios");
const clipboardy = require("clipboardy");
const dotenv = require("dotenv");
const moment = require("moment");
const R = require("ramda");
const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");

dotenv.config();

// https://www.freecodecamp.org/news/cjn-google-sheets-as-json-endpoint/
const GOOGLE_SHEET_URL = [
  `https://spreadsheets.google.com/feeds/cells/`,
  process.env.GOOGLE_SHEET_ID,
  `/1/public/full?alt=json`,
].join("");

const axiosInstance = axios.create({
  baseURL: "https://lichess.org/api",
  headers: {
    Authorization: `Bearer ${process.env.LICHESS_API_ACCESS_TOKEN}`,
  },
});

const now = () => moment().toISOString();
const waitFor = (inMs) => new Promise((resolve) => setTimeout(resolve, inMs));

function normalizeGoogleSheetData(feedEntry) {
  const cells = R.values(feedEntry);

  const dataProps = R.pipe(
    // Filter body cells out
    R.filter(({ gs$cell: { row } }) => Number(row) === 1),
    // Extract each cell value
    R.map(({ content: { $t } }) => $t)
  )(cells);

  const data = R.pipe(
    // Filter header cells out
    R.filter(({ gs$cell: { row } }) => Number(row) !== 1),
    // Extract each cell value
    R.map(({ content: { $t } }) => $t),
    // Split into rows
    R.splitEvery(dataProps.length),
    // Transform rows into objects
    R.map(R.zipObj(dataProps))
  )(cells);

  return data;
}

async function getTeamsSheetData() {
  try {
    const { data: teamsData } = await axiosInstance.get(GOOGLE_SHEET_URL);

    return normalizeGoogleSheetData(teamsData.feed.entry);
  } catch (err) {
    console.log(now(), `[getTeamsSheetData()] ${err}`);
  }
}

async function list(options) {
  try {
    const { data: tournamentData } = await axiosInstance.get(
      `/tournament/${options.tournamentId}`
    );

    const teamPairs = R.pipe(
      R.toPairs,
      R.sortBy(R.prop(0))
    )(tournamentData.teamBattle.teams);

    if (!options.new) {
      console.log(teamPairs);

      return;
    }

    const teamsSheetData = await getTeamsSheetData();
    const teamSheetTeamIds = R.map(R.prop("id"), teamsSheetData);

    const newTeamsTsv = R.pipe(
      R.filter(([teamId]) => !R.includes(teamId, teamSheetTeamIds)),
      R.map(
        ([teamId, teamName]) =>
          `${teamId}\t${teamName}\t${teamName}\t-\t-\tFALSE\tFALSE\tFALSE\tFALSE\tFALSE\t-`
      ),
      R.join(`\n`)
    )(teamPairs);

    if (newTeamsTsv.length === 0) {
      console.log(`There is no new team.`);

      return;
    }

    clipboardy.writeSync(newTeamsTsv);
    console.log(`${newTeamsTsv.split(/\n/).length} new teams TSV copied.`);
  } catch (err) {
    console.log(now(), `[list()] ${err}`);
  }
}

yargs(hideBin(process.argv))
  .command(
    "list [tournamentId]",
    "List existing tournament teams",
    (yargs) => yargs.positional("tournamentId", {}),
    list
  )
  .demandCommand()
  .option("tournamentId", {
    type: "string",
    description: "Tournament ID.",
    demandOption: true,
  })
  .option("new", {
    type: "boolean",
    description: "List only new teams.",
    default: false,
  }).argv;
