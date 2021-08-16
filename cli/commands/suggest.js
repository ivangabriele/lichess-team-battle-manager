const Table = require('cli-table3')
const moment = require('moment')
const R = require('ramda')

const getCountryFromCountryCode = require('../helpers/getCountryFromCountryCode')
const now = require('../helpers/now')
const waitFor = require('../helpers/waitFor')
const blacklist = require('../libs/blacklist')
const failsSheet = require('../libs/failsSheet')
const leadsSheet = require('../libs/leadsSheet')
const requester = require('../libs/requester')
const teamsSheet = require('../libs/teamsSheet')

async function suggest({ blacklist: isBlacklist }) {
  try {
    const leadsSheetList = await leadsSheet.get()

    if (isBlacklist) {
      const leadsSheetSilentLeaderIds = R.pipe(
        R.filter(({ isContacted, hasReplied }) => isContacted && !hasReplied),
        R.map(R.prop('leaderId')),
      )(leadsSheetList)

      const oldBlacklist = blacklist.get()
      blacklist.add(leadsSheetSilentLeaderIds)
      const newBlacklist = blacklist.get()

      const counter = newBlacklist.length - oldBlacklist.length
      console.info(`${counter} leaders have been added to the Blacklist.`)

      return
    }

    const leadsSheetLeaderlessTeamIds = R.pipe(
      R.filter(({ leaderId, leaderName }) => leaderId === null || leaderName === null || blacklist.has(leaderId)),
    )(leadsSheetList)

    if (leadsSheetLeaderlessTeamIds.length === 0) {
      console.info(`There is no leaderless team.`)

      return
    }

    let index = -1
    while (++index < 5) {
      const table = new Table({
        head: [
          `ID`,
          `First Name`,
          `Online`,
          `Classicals`,
          `Followers`,
          `Title`,
          `FIDE`,
          `Country`,
          `URL`,
          ``,
          `BL`,
          'FS',
          'TS',
        ],
      })

      const teamId = leadsSheetLeaderlessTeamIds[index].id
      const teamName = leadsSheetLeaderlessTeamIds[index].name
      console.info(`Team: ${teamName}`)

      const { data: lichessTeam } = await requester.get(`/api/team/${teamId}`)
      const leaderIds = R.map(({ id }) => id, lichessTeam.leaders)

      const indexBisMax = leaderIds.length
      let indexBis = -1
      while (++indexBis < indexBisMax) {
        const leaderId = leaderIds[indexBis]
        const { data: lichessUser } = await requester.get(`/api/user/${leaderId}`)

        if (lichessUser.closed === true) {
          continue
        }

        table.push([
          lichessUser.id,
          lichessUser.profile?.firstName ? lichessUser.profile.firstName : `-`,
          moment(lichessUser.seenAt).fromNow(),
          lichessUser.perfs.classical.games,
          lichessUser.nbFollowers,
          lichessUser.title ? lichessUser.title : `-`,
          lichessUser.profile?.fideRating ? lichessUser.profile.fideRating : `-`,
          getCountryFromCountryCode(lichessUser.profile?.country),
          lichessUser.url,
          lichessUser.id === lichessTeam.leader.id ? `👑` : ``,
          blacklist.has(lichessUser.id) ? `❗` : `✅`,
          (await failsSheet.hasLeaderId(lichessUser.id)) ? `❗` : `✅`,
          (await teamsSheet.hasLeaderId(lichessUser.id)) ? `❗` : `✅`,
        ])
      }

      console.info(table.toString())

      await waitFor(10000)
    }
  } catch (err) {
    console.error(now(), `[commands/suggest()] ${err}`)
  }
}

module.exports = suggest
