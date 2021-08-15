const Table = require('cli-table3')
const clipboardy = require('clipboardy')
const ora = require('ora')
const R = require('ramda')

const now = require('../helpers/now')
const waitFor = require('../helpers/waitFor')
const requester = require('../libs/requester')

async function clean({ tournamentId }) {
  let maybeErrorTeam

  try {
    const spinner = ora().start()
    const table = new Table({
      head: [`Id`, `Name`, `Active`],
    })

    const { data: lichessTournamentData } = await requester.get(`/api/tournament/${tournamentId}`)
    const { data: inactiveTeamIds } = await requester.get(
      `https://battle.world-classicals.com/data/inactive-team-ids.json`,
    )

    const normalizedTournamentTeams = R.pipe(
      R.toPairs,
      R.map(([teamId, teamName]) => ({ id: teamId, name: teamName })),
    )(lichessTournamentData.teamBattle.teams)

    const newLichessTeamBattleTeamsList = []
    const indexMax = normalizedTournamentTeams.length
    let index = -1
    while (++index < indexMax) {
      const { id, name } = normalizedTournamentTeams[index]
      maybeErrorTeam = name
      spinner.text = `${String(index + 1).padStart(2, '0')}/${indexMax} Checking team: ${name}…`
      const { data: lichessTeamData } = await requester.get(`/api/team/${id}`)

      const isActive = !R.includes(id)(inactiveTeamIds)
      if (isActive) {
        newLichessTeamBattleTeamsList.push(`${id} "${name}" by ${lichessTeamData.leader.name}`)
      }

      table.push([id, name, isActive ? `✅` : `❌`])

      await waitFor(1000)
    }

    spinner.stop()
    console.info(table.toString())

    const newLichessTeamBattleTeamsListSource = `${newLichessTeamBattleTeamsList.join('\n')}\n`
    clipboardy.writeSync(newLichessTeamBattleTeamsListSource)
    console.info(`Lichess Team Battle new list of ${newLichessTeamBattleTeamsList.length} teams copied.`)
  } catch (err) {
    console.error(now(), `[commands/clean()] ${err}`)
    console.error(now(), `[commands/clean()] Team: ${maybeErrorTeam}`)
  }
}

module.exports = clean
