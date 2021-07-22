const fs = require("fs");
const { matchSorter } = require("match-sorter");
const path = require("path");
const R = require("ramda");

const now = require("../helpers/now");

class Blacklist {
  constructor() {
    try {
      this._path = path.resolve(__dirname, "../../data/blacklist.json");

      this._load();
    } catch (err) {
      console.log(now(), `[libs/Blacklist#constructor()] ${err}`);
    }
  }

  _load() {
    try {
      if (!fs.existsSync(this._path)) {
        this._set([]);
        this._save();

        return;
      }

      const source = fs.readFileSync(this._path);

      this._set(JSON.parse(source));
    } catch (err) {
      console.log(now(), `[libs/Blacklist#_load()] ${err}`);
    }
  }

  _save() {
    try {
      const source = JSON.stringify(this._list, null, 2);

      fs.writeFileSync(this._path, source);
    } catch (err) {
      console.log(now(), `[libs/Blacklist#_save()] ${err}`);
    }
  }

  _set(newList) {
    this._list = newList;
    this._listLowerCase = R.map((userId) => userId.toLowerCase(), newList);
  }

  get() {
    return this._list;
  }

  has(userId) {
    return this._list.includes(userId) || this._listLowerCase.includes(userId);
  }

  add(userIds) {
    try {
      const newList = R.uniq(matchSorter([...this._list, ...userIds], ""));
      this._set(newList);

      this._save();
    } catch (err) {
      console.log(now(), `[libs/Blacklist#add()] ${err}`);
    }
  }
}

module.exports = new Blacklist();
