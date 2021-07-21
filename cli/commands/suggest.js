const countries = require("i18n-iso-countries");
const moment = require("moment");
const R = require("ramda");
const Table = require("cli-table3");

const getCountryFromCountryCode = require("../helpers/getCountryFromCountryCode");
const now = require("../helpers/now");
const requester = require("../libs/requester");
const teamsSheet = require("../libs/teamsSheet");

const WEIGHTING = {
  HAS_TITLE: 10,
  HAS_TOO_MANY_FOLLOWERS: -10,
  IS_PATRON: 10,
};

async function suggest({ tournamentId }) {
  try {
    const table = new Table({
      head: [
        "ID",
        "First Name",
        "Online",
        "Classicals",
        "Followers",
        "Title",
        "FIDE",
        "Country",
        "URL",
      ],
    });

    const teamsSheetList = await teamsSheet.get();
    const teamsSheetLeaderlessTeamIds = R.filter(
      ({ leaderId, leaderName }) => leaderId === null || leaderName === null,
      teamsSheetList
    );

    if (teamsSheetLeaderlessTeamIds.length === 0) {
      console.log(`There is no leaderless team.`);

      return;
    }

    const teamId = teamsSheetLeaderlessTeamIds[0].id;
    const teamName = teamsSheetLeaderlessTeamIds[0].name;
    console.log(`Team: ${teamName}`);

    const { data: lichessTeam } = await requester.get(`/api/team/${teamId}`);
    const leaderIds = R.map(({ id }) => id, lichessTeam.leaders);

    const indexMax = leaderIds.length;
    let index = -1;
    while (++index < indexMax) {
      const leaderId = leaderIds[index];
      const { data: lichessUser } = await requester.get(
        `/api/user/${leaderId}`
      );

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
      ]);
    }

    console.log(table.toString());
  } catch (err) {
    console.log(now(), `[commands/suggest()] ${err}`);
  }
}

module.exports = suggest;
