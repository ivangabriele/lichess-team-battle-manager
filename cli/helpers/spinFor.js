const moment = require('moment')
const ora = require('ora')

const waitFor = inMs => new Promise(resolve => setTimeout(resolve, inMs))

async function spinFor(inMin) {
  const spinner = ora().start()
  const end = moment().add(inMin, 'minutes')
  let diff = Infinity

  while (diff > 0) {
    diff = end.diff(moment())
    spinner.text = `Next API call in ${moment.utc(diff).format('mm:ss')}`

    await waitFor(1000)
  }

  spinner.stop()
}

module.exports = spinFor
