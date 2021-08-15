const normalizeGoogleSheetData = require('../helpers/normalizeGoogleSheetData')
const now = require('../helpers/now')
const requester = require('./requester')

const { GOOGLE_SHEET_ID, GOOGLE_SHEET_TEAMS_GID } = process.env

const GOOGLE_SHEET_TEAMS_URL = [
  `https://docs.google.com/spreadsheets/d/e/`,
  GOOGLE_SHEET_ID,
  `/pub?gid=`,
  GOOGLE_SHEET_TEAMS_GID,
  `&single=true&output=csv`,
].join('')

class TeamsSheet {
  constructor() {
    this._rows = []
  }

  async _load() {
    try {
      const { data: teamsSheetDataCsv } = await requester.get(GOOGLE_SHEET_TEAMS_URL)

      this._rows = await normalizeGoogleSheetData(teamsSheetDataCsv)
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
