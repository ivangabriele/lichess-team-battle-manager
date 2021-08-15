const fs = require('fs')
const { matchSorter } = require('match-sorter')
const path = require('path')
const R = require('ramda')

const now = require('../helpers/now')

class Blacklist {
  constructor() {
    try {
      this._path = path.resolve(__dirname, '../../data/blacklist.json')

      this._load()
    } catch (err) {
      console.error(now(), `[libs/Blacklist#constructor()] ${err}`)
    }
  }

  _load() {
    try {
      if (!fs.existsSync(this._path)) {
        this._list = []
        this._save()

        return
      }

      const source = fs.readFileSync(this._path)

      this._list = JSON.parse(source)
    } catch (err) {
      console.error(now(), `[libs/Blacklist#_load()] ${err}`)
    }
  }

  _save() {
    try {
      const source = JSON.stringify(this._list, null, 2)

      fs.writeFileSync(this._path, source)
    } catch (err) {
      console.error(now(), `[libs/Blacklist#_save()] ${err}`)
    }
  }

  get() {
    return this._list
  }

  has(userId) {
    return this._list.includes(userId.toLowerCase())
  }

  add(userIds) {
    try {
      this._list = R.pipe(() => matchSorter([...this._list, ...userIds], ''), R.uniq, R.map(R.toLower))()

      this._save()
    } catch (err) {
      console.error(now(), `[libs/Blacklist#add()] ${err}`)
    }
  }
}

module.exports = new Blacklist()
