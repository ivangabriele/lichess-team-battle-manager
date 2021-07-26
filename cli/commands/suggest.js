const fs = require("fs");
const moment = require("moment");
const path = require("path");
const R = require("ramda");
const Table = require("cli-table3");

const getCountryFromCountryCode = require("../helpers/getCountryFromCountryCode");
const now = require("../helpers/now");
const blacklist = require("../libs/blacklist");
const requester = require("../libs/requester");
const leadsSheet = require("../libs/leadsSheet");

const WEIGHTING = {
  HAS_TITLE: 10,
  HAS_TOO_MANY_FOLLOWERS: -10,
  IS_PATRON: 10,
};

async function suggest({ blacklist: isBlacklist, tournamentId }) {
  try {
    const leadsSheetList = await leadsSheet.get();

    if (isBlacklist) {
      const leadsSheetSilentLeaderIds = R.pipe(
        R.filter(({ hasAccepted, hasReplied }) => !hasReplied && !hasAccepted),
        R.map(R.prop("leaderId"))
      )(leadsSheetList);

      const oldBlacklist = blacklist.get();
      blacklist.add(leadsSheetSilentLeaderIds);
      const newBlacklist = blacklist.get();

      const counter = newBlacklist.length - oldBlacklist.length;
      console.log(`${counter} leaders have been added to the Blacklist.`);

      return;
    }

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
        ``,
      ],
    });

    const leadsSheetLeaderlessTeamIds = R.pipe(
      R.filter(({ isExcluded }) => !isExcluded),
      R.filter(
        ({ leaderId, leaderName }) =>
          leaderId === null || leaderName === null || blacklist.has(leaderId)
      )
    )(leadsSheetList);

    if (leadsSheetLeaderlessTeamIds.length === 0) {
      console.log(`There is no leaderless team.`);

      return;
    }

    const teamId = leadsSheetLeaderlessTeamIds[0].id;
    const teamName = leadsSheetLeaderlessTeamIds[0].name;
    console.log(`Team: ${teamName}`);

    const { data: lichessTeam } = await requester.get(`/api/team/${teamId}`);
    const leaderIds = R.map(({ id }) => id, lichessTeam.leaders);

    const indexMax = leaderIds.length;
    let index = -1;
    while (++index < indexMax) {
      const leaderId = leaderIds[index];
      const { data: lichessUser } = await requester.get(`/api/user/${leaderId}`);

      if (lichessUser.closed === true) {
        continue;
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
      ]);
    }

    console.log(table.toString());
  } catch (err) {
    console.log(now(), `[commands/suggest()] ${err}`);
  }
}

module.exports = suggest;
