const R = require('ramda')

const generateMessage = require('../helpers/generateMessage')
const now = require('../helpers/now')
const spinFor = require('../helpers/spinFor')
const leadsSheet = require('../libs/leadsSheet')
const requester = require('../libs/requester')
const teamsSheet = require('../libs/teamsSheet')

async function inviteNewTeam(tournamentId) {
  try {
    const leadsSheetList = await leadsSheet.get()

    const newTeams = R.filter(({ hasAccepted, isContacted }) => !isContacted && !hasAccepted, leadsSheetList)

    if (newTeams.length === 0) {
      console.info(`All leads have been invited.`)

      return
    }

    const indexMax = newTeams.length
    let index = -1
    while (++index < indexMax) {
      const { leaderId, leaderName, name } = newTeams[index]
      if (leaderName === null) {
        continue
      }

      const message = generateMessage('first', {
        LEADER_NAME: leaderName,
        TEAM_NAME: name,
        TOURNAMENT_ID: tournamentId,
      })

      console.info(`First time invitation will be sent to @${leaderId} for the team: ${name}.`)
      // console.log(message);
      await requester.post(`/inbox/${leaderId}`, { text: message })
      console.info(`Invitation sent ✅.`)

      if (index < indexMax - 1) {
        // Limited by the API Rate Limit:
        // It should be 25 * 20 = 500/d but is it rather 3/h?
        // https://github.com/ornicar/lila/blob/master/modules/msg/src/main/MsgSecurity.scala#L44
        // https://github.com/ornicar/lila/blob/master/modules/msg/src/main/MsgSecurity.scala#L33
        await spinFor(1)
      }
    }
  } catch (err) {
    console.error(now(), `[commands/invite#inviteNewTeam()] ${err}`)
    console.error(now(), `[commands/invite#inviteNewTeam()] ${err?.response?.data?.error}`)
  }
}

async function invite({ new: isNew, tournamentId }) {
  try {
    if (isNew) {
      await inviteNewTeam(tournamentId)

      return
    }

    const teamsSheetList = await teamsSheet.get()

    const nonInvitedTeams = R.filter(({ isInvited }) => !isInvited, teamsSheetList)

    if (nonInvitedTeams.length === 0) {
      console.info(`All teams have been invited.`)

      return
    }

    const indexMax = nonInvitedTeams.length
    let index = -1
    while (++index < indexMax) {
      const { isCoupled, leaderId, leaderName, name, rank } = nonInvitedTeams[index]
      if (leaderName === null || isCoupled) {
        continue
      }

      const coupledNames = R.pipe(
        R.filter(({ isCoupled: _isCoupled, leaderId: _leaderId }) => _leaderId === leaderId && _isCoupled),
        R.map(({ name: _name }) => _name),
      )(nonInvitedTeams)

      let message
      if (coupledNames.length !== 0) {
        const names = [name, ...coupledNames].join(`, `)
        message = generateMessage('multiple', {
          LEADER_NAME: leaderName,
          TEAM_NAME: names,
          TOURNAMENT_ID: tournamentId,
        })

        console.info(`Normal invitation will be sent to @${leaderId} for the teams: ${names}.`)
      } else if (rank !== null) {
        const names = [name, ...coupledNames].join(`, `)
        message = generateMessage('podium', {
          LEADER_NAME: leaderName,
          RANK: rank,
          TEAM_NAME: names,
          TOURNAMENT_ID: tournamentId,
        })

        console.info(`Podium invitation will be sent to @${leaderId} for the teams: ${names}.`)
      } else {
        message = generateMessage('normal', {
          LEADER_NAME: leaderName,
          TEAM_NAME: name,
          TOURNAMENT_ID: tournamentId,
        })

        console.info(`Normal invitation will be sent to @${leaderId} for the team: ${name}.`)
      }

      // console.log(message);
      // console.log();
      await requester.post(`/inbox/${leaderId}`, { text: message })
      console.info(`Invitation sent ✅.`)

      if (index < indexMax - 1) {
        // Limited by the API Rate Limit:
        // It should be 25 * 20 = 500/d but is it rather 3/h?
        // https://github.com/ornicar/lila/blob/master/modules/msg/src/main/MsgSecurity.scala#L44
        // https://github.com/ornicar/lila/blob/master/modules/msg/src/main/MsgSecurity.scala#L33
        await spinFor(3)
      }
    }
  } catch (err) {
    console.error(now(), `[commands/invite()] ${err}`)
    console.error(now(), `[commands/invite()] ${err?.response?.data?.error}`)
  }
}

module.exports = invite
