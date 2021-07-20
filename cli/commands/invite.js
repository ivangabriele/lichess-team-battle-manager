const R = require("ramda");

const generateMessage = require("../helpers/generateMessage");
const now = require("../helpers/now");
const spinFor = require("../helpers/spinFor");
const requester = require("../libs/requester");
const teamsSheet = require("../libs/teamsSheet");

async function invite(options) {
  try {
    const teamsSheetList = await teamsSheet.get();

    const newTeams = R.filter(
      ({ isContacted }) => !isContacted,
      teamsSheetList
    );

    let index = newTeams.length;
    while (--index >= 0) {
      const { leaderId, leaderName, name } = newTeams[index];
      if (leaderName === null) {
        continue;
      }

      const message = generateMessage(
        "firstTime",
        leaderName,
        name,
        options.tournamentId
      );

      await requester.post(`/inbox/${leaderId}`, { text: message });
      console.log(
        `First time invitation sent to @${leaderId} for the team: ${name}.`
      );

      if (index > 0) {
        // Limited by the API Rate Limit:
        // It should be 25 * 20 = 500/d but is it rather 3/h?
        // https://github.com/ornicar/lila/blob/master/modules/msg/src/main/MsgSecurity.scala#L44
        // https://github.com/ornicar/lila/blob/master/modules/msg/src/main/MsgSecurity.scala#L33
        await spinFor(20);
      }
    }
  } catch (err) {
    console.log(now(), `[commands/invite()] ${err}`);
    console.log(now(), `[commands/invite()] ${err?.response?.data?.error}`);
  }
}

module.exports = invite;
