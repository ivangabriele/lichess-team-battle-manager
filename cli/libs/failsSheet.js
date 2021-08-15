const R = require('ramda')

const normalizeGoogleSheetData = require('../helpers/normalizeGoogleSheetData')
const now = require('../helpers/now')
const requester = require('./requester')

const { GOOGLE_SHEET_ID, GOOGLE_SHEET_FAILS_GID } = process.env

const GOOGLE_SHEET_TEAMS_URL = [
  `https://docs.google.com/spreadsheets/d/e/`,
  GOOGLE_SHEET_ID,
  `/pub?gid=`,
  GOOGLE_SHEET_FAILS_GID,
  `&single=true&output=csv`,
].join('')

class FailsSheet {
  constructor() {
    this._rows = []
  }

  async _load() {
    try {
      const { data: teamsSheetDataCsv } = await requester.get(GOOGLE_SHEET_TEAMS_URL)

      this._rows = await normalizeGoogleSheetData(teamsSheetDataCsv)
    } catch (err) {
      console.error(now(), `[libs/FailsSheet#load()] ${err}`)
    }
  }

  async get() {
    await this._load()

    return this._rows.filter(({ isSpecial }) => !isSpecial)
  }

  async getIds() {
    try {
      return (await this.get()).map(({ id }) => id)
    } catch (err) {
      console.error(now(), `[libs/FailsSheet#getIds()] ${err}`)

      return []
    }
  }

  async getLeaderIds() {
    try {
      return (await this.get()).map(({ leaderId }) => leaderId)
    } catch (err) {
      console.error(now(), `[libs/FailsSheet#getLeaderIds()] ${err}`)

      return []
    }
  }

  async hasLeaderId(leaderId) {
    try {
      const leaderIds = await this.getLeaderIds()

      return R.includes(R.toLower(leaderId))(leaderIds)
    } catch (err) {
      console.error(now(), `[libs/FailsSheet#getLeaderIds()] ${err}`)

      return []
    }
  }
}

module.exports = new FailsSheet()
