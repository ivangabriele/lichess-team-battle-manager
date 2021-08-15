const Table = require('cli-table3')
const moment = require('moment')
const ora = require('ora')
const R = require('ramda')

const normalizeLichessTournamentsList = require('../helpers/normalizeLichessTournamentsList')
const now = require('../helpers/now')
const requester = require('../libs/requester')
const teamsSheet = require('../libs/teamsSheet')

async function checkFutureTournament(tournamentId) {
  try {
    const spinner = ora().start()
    const table = new Table({
      head: [`Id`, `Name`, `Registered`, ``],
    })

    const teamsSheetList = await teamsSheet.getAll()
    const teamsSheetRegisteredTeamIds = R.pipe(
      R.filter(({ hasJoined: _hasJoined }) => _hasJoined),
      R.map(({ id }) => id),
    )(teamsSheetList)

    const { data: tournamentData } = await requester.get(`/api/tournament/${tournamentId}`)

    const teamPairs = R.toPairs(tournamentData.teamBattle.teams)
    const indexMax = teamPairs.length
    let counter = 0
    let index = -1
    while (++index < indexMax) {
      const teamPair = teamPairs[index]
      spinner.text = `${String(index + 1).padStart(2, '0')}/${indexMax} Checking team: ${teamPair[1]}…`
      const { data: teamTournamentsData } = await requester.get(`/api/team/${teamPair[0]}/arena?max=200`)
      const teamTournaments = normalizeLichessTournamentsList(teamTournamentsData)

      const hasJoined = Boolean(R.find(({ id }) => id === tournamentId, teamTournaments))

      counter += Number(hasJoined)
      table.push([
        ...teamPair,
        hasJoined ? `YES` : `NO`,
        (hasJoined && !teamsSheetRegisteredTeamIds.includes(teamPair[0])) ||
        (!hasJoined && teamsSheetRegisteredTeamIds.includes(teamPair[0]))
          ? `❗`
          : `✅`,
      ])
    }

    spinner.stop()
    console.info(table.toString())
    console.info(`${counter}/${teamPairs.length} teams are registered.`)
  } catch (err) {
    console.error(now(), `[commands/check#checkFutureTournament()] ${err}`)
  }
}

async function checkTournamentSychronization(tournamentId) {
  try {
    const table = new Table({
      head: [`Id`, `Name`, `Teams Sheet`, `Team Battle`, `Active`],
    })

    const teamsSheetTeams = await teamsSheet.getAll()
    const teamsSheetTeamIds = await teamsSheet.getAllIds()

    const { data: lichessTeamBattleData } = await requester.get(`/api/tournament/${tournamentId}`)
    const lichessTeamBattleTeams = R.pipe(
      R.toPairs,
      R.map(([teamId, teamName]) => ({ id: teamId, name: teamName })),
    )(lichessTeamBattleData.teamBattle.teams)
    const lichessTeamBattleTeamIds = R.map(R.prop('id'))(lichessTeamBattleTeams)

    const bothTeamIds = R.pipe(R.sortBy(R.prop(0)), R.uniq)([...teamsSheetTeamIds, ...lichessTeamBattleTeamIds])

    const { data: inactiveTeamIds } = await requester.get(
      `https://battle.world-classicals.com/data/inactive-team-ids.json`,
    )

    table.push(
      ...R.reduce((tableRows, teamId) => {
        const isInTeamsSheet = R.includes(teamId)(teamsSheetTeamIds)
        const isInLichessTeamBattle = R.includes(teamId)(lichessTeamBattleTeamIds)
        const isActive = !R.includes(teamId)(inactiveTeamIds)

        if (isInTeamsSheet && isInLichessTeamBattle && isActive) {
          return tableRows
        }

        const name = isInTeamsSheet
          ? R.find(R.propEq('id', teamId))(teamsSheetTeams).name
          : R.find(R.propEq('id', teamId))(lichessTeamBattleTeams).name

        const newRow = [
          teamId,
          name,
          isInTeamsSheet ? `✅` : `❌`,
          isInLichessTeamBattle ? `✅` : `❌`,
          isActive ? `✅` : `❌`,
        ]

        return [...tableRows, newRow]
      }, [])(bothTeamIds),
    )

    console.info(table.toString())
  } catch (err) {
    console.error(now(), `[commands/check#checkTournamentSychronization()] ${err}`)
  }
}

async function check({ tournamentId, sync: isSync }) {
  try {
    if (isSync) {
      await checkTournamentSychronization(tournamentId)

      return
    }

    const { data: tournamentData } = await requester.get(`/api/tournament/${tournamentId}`)

    const tournamentEnd = moment(tournamentData.startsAt).add(12, 'hours')

    if (tournamentEnd.unix() < moment().unix()) {
      console.info(tournamentData)

      return
    }

    checkFutureTournament(tournamentId)
  } catch (err) {
    console.error(now(), `[commands/check()] ${err}`)
  }
}

module.exports = check
