const clipboardy = require("clipboardy");
const R = require("ramda");

const generateMessage = require("../helpers/generateMessage");
const now = require("../helpers/now");
const spinFor = require("../helpers/spinFor");
const requester = require("../libs/requester");
const teamsSheet = require("../libs/teamsSheet");

async function invite({ byHand, tournamentId }) {
  try {
    const teamsSheetList = await teamsSheet.get();

    const newTeams = R.filter(
      ({ hasAccepted, isContacted }) => !isContacted && !hasAccepted,
      teamsSheetList
    );

    if (newTeams.length === 0) {
      console.log(`There is no team to invite.`);

      return;
    }

    const indexMax = newTeams.length;
    let index = -1;
    while (++index < indexMax) {
      const { leaderId, leaderName, name } = newTeams[index];
      if (leaderName === null) {
        continue;
      }

      console.log(
        `First time invitation will be sent to @${leaderId} for the team: ${name}.`
      );

      const message = generateMessage(
        "firstTime",
        leaderName,
        name,
        tournamentId
      );

      if (byHand) {
        console.log(`Team: ${name}`);
        console.log(`Link: https://lichess.org/inbox/${leaderId}`);

        clipboardy.writeSync(message);
        console.log(`Invitation text copied.`);

        return;
      }

      await requester.post(`/inbox/${leaderId}`, { text: message });
      console.log(`Invitation sent ✅.`);

      if (index < indexMax - 1) {
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
