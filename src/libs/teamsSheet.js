const requester = require("./requester");
const normalizeGoogleSheetData = require("../helpers/normalizeGoogleSheetData");
const now = require("../helpers/now");

const { GOOGLE_SHEET_ID } = process.env;

// https://www.freecodecamp.org/news/cjn-google-sheets-as-json-endpoint/
const GOOGLE_SHEET_URL = [
  `https://spreadsheets.google.com/feeds/cells/`,
  GOOGLE_SHEET_ID,
  `/1/public/full?alt=json`,
].join("");

class TeamsSheet {
  constructor() {
    this.teams = [];
  }

  async load() {
    try {
      const { data: teamsData } = await requester.get(GOOGLE_SHEET_URL);

      this.teams = normalizeGoogleSheetData(teamsData.feed.entry);
    } catch (err) {
      console.log(now(), `[libs/teamsSheet#load()] ${err}`);
    }
  }

  async get() {
    await this.load();

    return this.teams;
  }

  async getIds() {
    try {
      await this.load();

      return this.teams.map(({ id }) => id);
    } catch (err) {
      console.log(now(), `[libs/teamsSheet#getIds()] ${err}`);
    }
  }
}

module.exports = new TeamsSheet();
