const clipboardy = require("clipboardy");
const R = require("ramda");

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
      const teamsSheetList = await teamsSheet.get();
      const tournamentTeamIds = R.map(([teamId]) => teamId, teamPairs);
      const excludedTeamsLists = R.pipe(
        R.filter(({ isExcluded }) => isExcluded),
        R.map(({ id, name, note }) => {
          const log = `${id} "${name}" (Note: ${note})`;

          if (tournamentTeamIds.includes(id)) {
            return `⚠️  ${log}`;
          }

          return log;
        }),
        R.join(`\n`)
      )(teamsSheetList);

      console.log(excludedTeamsLists);

      return;
    }

    if (isNew) {
      const teamSheetIds = await teamsSheet.getIds();
      const newTeamsTsv = R.pipe(
        R.filter(([teamId]) => !R.includes(teamId, teamSheetIds)),
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

      return;
    }

    const list = R.pipe(
      R.map(([teamId, teamName]) => `${teamId} "${teamName}"`),
      R.join(`\n`)
    )(teamPairs);

    console.log(list);
  } catch (err) {
    console.log(now(), `[commands/list()] ${err}`);
  }
}

module.exports = list;
