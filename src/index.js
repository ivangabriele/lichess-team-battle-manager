const axios = require("axios");
const clipboardy = require("clipboardy");
const dotenv = require("dotenv");
const moment = require("moment");
const ora = require("ora");
const R = require("ramda");
const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");

const MESSAGES = require("./messages.json");

dotenv.config();

// https://www.freecodecamp.org/news/cjn-google-sheets-as-json-endpoint/
const GOOGLE_SHEET_URL = [
  `https://spreadsheets.google.com/feeds/cells/`,
  process.env.GOOGLE_SHEET_ID,
  `/1/public/full?alt=json`,
].join("");

const axiosInstance = axios.create({
  baseURL: "https://lichess.org",
  headers: {
    Authorization: `Bearer ${process.env.LICHESS_API_ACCESS_TOKEN}`,
  },
});

const now = () => moment().toISOString();
const waitFor = (inMs) => new Promise((resolve) => setTimeout(resolve, inMs));

async function spinFor(inMin) {
  const spinner = ora().start();
  const end = moment().add(inMin, "minutes");
  diff = Infinity;

  while (diff > 0) {
    diff = end.diff(moment());
    spinner.text = `Next API call in ${moment.utc(diff).format("mm:ss")}`;

    await waitFor(1000);
  }

  spinner.stop();
}

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
    // Convert string booleans to real ones
    R.map((value) =>
      value === "TRUE" ? true : value === "FALSE" ? false : value
    ),
    // Convert dashed values to `null`
    R.map((value) => (value === "-" ? null : value)),
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

function fillMessage(messageId, leaderName, teamName, tournamentId) {
  return R.pipe(
    R.replace(/{LEADER_NAME}/, String(leaderName)),
    R.replace(/{TEAM_NAME}/, String(teamName)),
    R.replace(/{TOURNAMENT_ID}/, String(tournamentId))
  )(MESSAGES[messageId]);
}

async function list(options) {
  try {
    const { data: tournamentData } = await axiosInstance.get(
      `/api/tournament/${options.tournamentId}`
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

async function invite(options) {
  try {
    const teamsSheetData = await getTeamsSheetData();

    const newTeams = R.filter(
      ({ isContacted }) => !isContacted,
      teamsSheetData
    );

    let index = newTeams.length;
    while (--index >= 0) {
      const { leaderId, leaderName, name } = newTeams[index];
      if (leaderName === null) {
        continue;
      }

      const message = fillMessage(
        "firstTime",
        leaderName,
        name,
        options.tournamentId
      );

      await axiosInstance.post(`/inbox/${leaderId}`, { text: message });
      console.log(
        `First time invitation sent to @${leaderId} for the team: ${name}.`
      );

      await spinFor(5);
    }
  } catch (err) {
    console.log(now(), `[invite()] ${err}`);
  }
}

yargs(hideBin(process.argv))
  .demandCommand()
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
  .option("new", {
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
