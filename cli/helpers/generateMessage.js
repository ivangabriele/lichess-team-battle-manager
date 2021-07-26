const R = require("ramda");

const MESSAGES = require("../messages.json");

const now = require("./now");

function generateMessage(messageKey, props) {
  try {
    let message = MESSAGES[messageKey];
    for (const [key, value] of Object.entries(props)) {
      message = message.replace(`{${key}}`, value);
    }

    return message;
  } catch (err) {
    console.log(now(), `[helpers/generateMessage()] ${err}`);
  }
}

module.exports = generateMessage;
