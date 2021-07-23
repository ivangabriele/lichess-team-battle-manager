const countries = require("i18n-iso-countries");

const now = require("./now");

function getCountryFromCountryCode(countryCode) {
  try {
    if (typeof countryCode !== "string") {
      return `-`;
    }

    const realCountry = countries.getName(countryCode, "en", {
      select: "official",
    });

    switch (true) {
      case realCountry !== undefined:
        return realCountry;

      case countryCode === `_belarus-wrw`:
        return `Belarus White-red-white`;

      case countryCode === `_earth`:
        return `Earth`;

      case countryCode === `_lichess`:
        return `Lichess`;

      case countryCode === `_pirate`:
        return `Pirate`;

      default:
        return countryCode;
    }
  } catch (err) {
    console.log(now(), `[helpers/getCountryFromCountryCode()] ${err}`);
  }
}

module.exports = getCountryFromCountryCode;
