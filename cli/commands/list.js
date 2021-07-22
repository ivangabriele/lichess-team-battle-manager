const clipboardy = require("clipboardy");
const R = require("ramda");
const Table = require("cli-table3");

const now = require("../helpers/now");
const requester = require("../libs/requester");
const teamsSheet = require("../libs/teamsSheet");

async function list({ excluded: isExcluded, new: isNew, tournamentId }) {
  try {
    const { data: tournamentData } = await requester.get(
      `/api/tournament/${tournamentId}`
    );

    const teamPairs = R.pipe(
      R.toPairs,
      R.sortBy(R.prop(0))
    )(tournamentData.teamBattle.teams);

    if (isExcluded) {
      const table = new Table({
        head: [`Id`, `Name`, `Note`, ``],
      });

      const teamsSheetList = await teamsSheet.get();
      const tournamentTeamIds = R.map(([teamId]) => teamId, teamPairs);
      R.pipe(
        R.filter(({ isExcluded }) => isExcluded),
        R.forEach(({ id, name, note }) => {
          table.push([
            id,
            name,
            note,
            tournamentTeamIds.includes(id) ? `❗` : ``,
          ]);
        })
      )(teamsSheetList);

      console.log(table.toString());

      return;
    }

    if (isNew) {
      const teamSheetIds = await teamsSheet.getAllIds();
      const newTeamsTsv = R.pipe(
        R.filter(([teamId]) => !R.includes(teamId, teamSheetIds)),
        R.map(
          ([teamId, teamName]) =>
            `${teamId}\t${teamName}\t${teamName}\t-\t-\tFALSE\tFALSE\tFALSE\tFALSE\tFALSE\tFALSE\t-`
        ),
        R.join(`\n`)
      )(teamPairs);

      if (newTeamsTsv.length === 0) {
        console.log(`There is no new team.`);

        return;
      }

      clipboardy.writeSync(newTeamsTsv);
      console.log(`${newTeamsTsv.split(/\n/).length} new teams TSV copied.`);

      return;
    }

    const table = new Table({
      head: [`Id`, `Name`],
    });

    teamPairs.forEach((teamPair) => table.push(teamPair));

    console.log(table.toString());
  } catch (err) {
    console.log(now(), `[commands/list()] ${err}`);
  }
}

module.exports = list;
