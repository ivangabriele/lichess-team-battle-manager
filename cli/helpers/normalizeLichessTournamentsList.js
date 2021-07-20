const now = require("./now");

function normalizeLichessTournamentsList(tournamentsData) {
  try {
    return tournamentsData.split(/\n/).reduce((currentArenas, arenaJson) => {
      try {
        currentArenas.push(JSON.parse(arenaJson.trim()));
      } catch (err) {}

      return currentArenas;
    }, []);
  } catch (err) {
    console.log(now(), `[helpers/normalizeLichessTournamentsList()] ${err}`);

    return [];
  }
}

module.exports = normalizeLichessTournamentsList;
