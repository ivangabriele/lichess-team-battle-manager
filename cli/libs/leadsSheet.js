const requester = require("./requester");
const normalizeGoogleSheetData = require("../helpers/normalizeGoogleSheetData");
const now = require("../helpers/now");

const { GOOGLE_SHEET_ID } = process.env;

// https://www.freecodecamp.org/news/cjn-google-sheets-as-json-endpoint/
const GOOGLE_SHEET_LEADS_URL = [
  `https://spreadsheets.google.com/feeds/cells/`,
  GOOGLE_SHEET_ID,
  `/1/public/full?alt=json`,
].join("");

class LeadsSheet {
  constructor() {
    this._rows = [];
  }

  async _load() {
    try {
      const { data: teamsData } = await requester.get(GOOGLE_SHEET_LEADS_URL);

      this._rows = normalizeGoogleSheetData(teamsData.feed.entry);
    } catch (err) {
      console.log(now(), `[libs/LeadsSheet#load()] ${err}`);
    }
  }

  async get() {
    await this._load();

    return this._rows.filter(({ isExcluded, isSpecial }) => !isExcluded && !isSpecial);
  }

  async getAll() {
    await this._load();

    return this._rows;
  }

  async getIds() {
    try {
      return (await this.get()).map(({ id }) => id);
    } catch (err) {
      console.log(now(), `[libs/LeadsSheet#getIds()] ${err}`);
    }
  }

  async getAllIds() {
    try {
      return (await this.getAll()).map(({ id }) => id);
    } catch (err) {
      console.log(now(), `[libs/LeadsSheet#getIds()] ${err}`);
    }
  }
}

module.exports = new LeadsSheet();
