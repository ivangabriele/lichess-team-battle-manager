const MESSAGES = require('../messages.json')
const now = require('./now')

function generateMessage(messageKey, props) {
  try {
    let message = MESSAGES[messageKey]
    // eslint-disable-next-line no-restricted-syntax
    for (const [key, value] of Object.entries(props)) {
      message = message.replace(`{${key}}`, value)
    }

    return message
  } catch (err) {
    console.error(now(), `[helpers/generateMessage()] ${err}`)

    return ''
  }
}

module.exports = generateMessage
