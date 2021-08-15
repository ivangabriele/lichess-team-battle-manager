const normalizeGoogleSheetData = require('../helpers/normalizeGoogleSheetData')
const now = require('../helpers/now')
const requester = require('./requester')

const { GOOGLE_SHEET_ID } = process.env

// https://www.freecodecamp.org/news/cjn-google-sheets-as-json-endpoint/
const GOOGLE_SHEET_TEAMS_URL = [
  `https://spreadsheets.google.com/feeds/cells/`,
  GOOGLE_SHEET_ID,
  `/2/public/full?alt=json`,
].join('')

class TeamsSheet {
  constructor() {
    this._rows = []
  }

  async _load() {
    try {
      const { data: teamsData } = await requester.get(GOOGLE_SHEET_TEAMS_URL)

      this._rows = normalizeGoogleSheetData(teamsData.feed.entry)
    } catch (err) {
      console.error(now(), `[libs/TeamsSheet#load()] ${err}`)
    }
  }

  async get() {
    await this._load()

    return this._rows.filter(({ isSpecial }) => !isSpecial)
  }

  async getAll() {
    await this._load()

    return this._rows
  }

  async getIds() {
    try {
      return (await this.get()).map(({ id }) => id)
    } catch (err) {
      console.error(now(), `[libs/TeamsSheet#getIds()] ${err}`)

      return []
    }
  }

  async getAllIds() {
    try {
      return (await this.getAll()).map(({ id }) => id)
    } catch (err) {
      console.error(now(), `[libs/TeamsSheet#getIds()] ${err}`)

      return []
    }
  }
}

module.exports = new TeamsSheet()
