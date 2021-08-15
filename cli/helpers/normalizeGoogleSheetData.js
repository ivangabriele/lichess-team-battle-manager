const _csvParse = require('csv-parse')
const R = require('ramda')
const { promisify } = require('util')

const csvParse = promisify(_csvParse)

const now = require('./now')

async function normalizeGoogleSheetData(csv) {
  try {
    const rawDataAs2dArray = await csvParse(csv)
    const dataProps = rawDataAs2dArray[0]

    const data = R.pipe(
      // Filter header cells out
      R.slice(1, Infinity),
      // Convert string booleans to real ones
      // eslint-disable-next-line no-nested-ternary
      R.map(R.map(value => (value === 'TRUE' ? true : value === 'FALSE' ? false : value))),
      // Convert empty values to `null`
      R.map(R.map(value => (value === '' ? null : value))),
      // Transform rows into objects
      R.map(R.zipObj(dataProps)),
    )(rawDataAs2dArray)

    return data
  } catch (err) {
    console.error(now(), `[helpers/normalizeGoogleSheetData()] ${err}`)

    return []
  }
}

module.exports = normalizeGoogleSheetData
