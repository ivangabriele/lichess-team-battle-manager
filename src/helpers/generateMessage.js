const MESSAGES = require("../messages.json");

const now = require("./now");

function generateMessage(messageKey, leaderName, teamName, tournamentId) {
  try {
    return R.pipe(
      R.replace(/{LEADER_NAME}/, String(leaderName)),
      R.replace(/{TEAM_NAME}/, String(teamName)),
      R.replace(/{TOURNAMENT_ID}/, String(tournamentId))
    )(MESSAGES[messageKey]);
  } catch (err) {
    console.log(now(), `[helpers/generateMessage()] ${err}`);
  }
}

module.exports = generateMessage;
