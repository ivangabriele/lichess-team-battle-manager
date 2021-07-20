const ora = require("ora");
const R = require("ramda");
const Table = require("cli-table3");

const normalizeLichessTournamentsList = require("../helpers/normalizeLichessTournamentsList");
const now = require("../helpers/now");
const requester = require("../libs/requester");
const teamsSheet = require("../libs/teamsSheet");

async function check({ tournamentId }) {
  try {
    console.log();
    const spinner = ora().start();
    const table = new Table({
      head: ["Id", "Name", "Registered"],
    });

    const teamsSheetList = await teamsSheet.get();
    const sheetRegisteredTeamIds = R.pipe(
      R.filter(({ hasAccepted }) => hasAccepted),
      R.map(({ id }) => id)
    )(teamsSheetList);

    const { data: tournamentData } = await requester.get(
      `/api/tournament/${tournamentId}`
    );

    const teamPairs = R.toPairs(tournamentData.teamBattle.teams);
    const indexMax = teamPairs.length;
    let counter = 0;
    let index = -1;
    while (++index < indexMax) {
      const teamPair = teamPairs[index];
      spinner.text = `${String(index + 1).padStart(
        2,
        "0"
      )}/${indexMax} Checking team: ${teamPair[1]}…`;
      const { data: teamTournamentsData } = await requester.get(
        `/api/team/${teamPair[0]}/arena`
      );
      const teamTournaments =
        normalizeLichessTournamentsList(teamTournamentsData);

      const hasJoined = Boolean(
        R.find(({ id }) => id === tournamentId, teamTournaments)
      );

      counter += Number(hasJoined);
      let registeredText = hasJoined ? `YES` : `NO`;
      if (hasJoined && !sheetRegisteredTeamIds.includes(teamPair[0])) {
        registeredText = `${registeredText} ⚠️ `;
      }
      table.push([...teamPair, registeredText]);
    }

    spinner.stop();
    console.log(table.toString());
    console.log(`${counter}/${teamPairs.length} teams are registered.`);
    console.log();
  } catch (err) {
    console.log(now(), `[commands/check()] ${err}`);
  }
}

module.exports = check;
