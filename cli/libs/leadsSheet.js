const normalizeGoogleSheetData = require('../helpers/normalizeGoogleSheetData')
const now = require('../helpers/now')
const requester = require('./requester')

const { GOOGLE_SHEET_ID, GOOGLE_SHEET_LEADS_GID } = process.env

const GOOGLE_SHEET_LEADS_URL = [
  `https://docs.google.com/spreadsheets/d/e/`,
  GOOGLE_SHEET_ID,
  `/pub?gid=`,
  GOOGLE_SHEET_LEADS_GID,
  `&single=true&output=csv`,
].join('')

class LeadsSheet {
  constructor() {
    this._rows = []
  }

  async _load() {
    try {
      const { data: leadsSheetDataCsv } = await requester.get(GOOGLE_SHEET_LEADS_URL)

      this._rows = normalizeGoogleSheetData(leadsSheetDataCsv)
    } catch (err) {
      console.error(now(), `[libs/LeadsSheet#load()] ${err}`)
    }
  }

  async get() {
    await this._load()

    return this._rows.filter(({ isExcluded, isSpecial }) => !isExcluded && !isSpecial)
  }

  async getAll() {
    await this._load()

    return this._rows
  }

  async getIds() {
    try {
      return (await this.get()).map(({ id }) => id)
    } catch (err) {
      console.error(now(), `[libs/LeadsSheet#getIds()] ${err}`)

      return []
    }
  }

  async getAllIds() {
    try {
      return (await this.getAll()).map(({ id }) => id)
    } catch (err) {
      console.error(now(), `[libs/LeadsSheet#getIds()] ${err}`)

      return []
    }
  }
}

module.exports = new LeadsSheet()
