const now = require("./now");

function normalizeLichessTournamentsList(tournamentsData) {
  if (typeof tournamentsData === "object") {
    return [tournamentsData];
  }

  if (tournamentsData.length === 0) {
    return [];
  }

  try {
    return tournamentsData.split(/\n/).reduce((currentArenas, arenaJson) => {
      try {
        currentArenas.push(JSON.parse(arenaJson.trim()));
      } catch (err) {}

      return currentArenas;
    }, []);
  } catch (err) {
    console.log(now(), `[helpers/normalizeLichessTournamentsList()] ${err}`);
  }
}

module.exports = normalizeLichessTournamentsList;
