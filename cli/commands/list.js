const Table = require('cli-table3')
const clipboardy = require('clipboardy')
const R = require('ramda')

const now = require('../helpers/now')
const leadsSheet = require('../libs/leadsSheet')
const requester = require('../libs/requester')
const teamsSheet = require('../libs/teamsSheet')

async function list({ excluded: isExcluded, new: isNew, tournamentId }) {
  try {
    const { data: tournamentData } = await requester.get(`/api/tournament/${tournamentId}`)

    const teamPairs = R.pipe(R.toPairs, R.sortBy(R.prop(0)))(tournamentData.teamBattle.teams)

    if (isExcluded) {
      const table = new Table({
        head: [`Id`, `Name`, `Note`, ``],
      })

      const leadsSheetList = await leadsSheet.getAll()
      const tournamentTeamIds = R.map(([teamId]) => teamId, teamPairs)
      R.pipe(
        R.filter(({ isExcluded: _isExcluded }) => _isExcluded),
        R.forEach(({ id, name, note }) => {
          table.push([id, name, note, tournamentTeamIds.includes(id) ? `❗` : `✅`])
        }),
      )(leadsSheetList)

      console.info(table.toString())

      return
    }

    if (isNew) {
      const leadsSheetIds = await leadsSheet.getAllIds()
      const teamsSheetIds = await teamsSheet.getAllIds()
      const newTeamsTsv = R.pipe(
        R.filter(([teamId]) => !R.includes(teamId, leadsSheetIds)),
        R.filter(([teamId]) => !R.includes(teamId, teamsSheetIds)),
        R.map(
          ([teamId, teamName]) =>
            `${teamId}\t${teamName}\t${teamName}\t-\t-\tFALSE\tFALSE\tFALSE\tFALSE\tFALSE\tFALSE\tFALSE\t-`,
        ),
        R.join(`\n`),
      )(teamPairs)

      if (newTeamsTsv.length === 0) {
        console.info(`There is no new team.`)

        return
      }

      clipboardy.writeSync(newTeamsTsv)
      console.info(`${newTeamsTsv.split(/\n/).length} new teams TSV copied.`)

      return
    }

    const table = new Table({
      head: [`Id`, `Name`],
    })

    teamPairs.forEach(teamPair => table.push(teamPair))

    console.info(table.toString())
  } catch (err) {
    console.error(now(), `[commands/list()] ${err}`)
  }
}

module.exports = list
