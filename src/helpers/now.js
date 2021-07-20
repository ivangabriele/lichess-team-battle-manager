const moment = require("moment");

function now() {
  return moment().toISOString();
}

module.exports = now;
