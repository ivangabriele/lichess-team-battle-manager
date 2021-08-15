const R = require('ramda')

const now = require('./now')

function normalizeGoogleSheetData(feedEntry) {
  try {
    const cells = R.values(feedEntry)

    const dataProps = R.pipe(
      // Filter body cells out
      R.filter(({ gs$cell: { row } }) => Number(row) === 1),
      // Extract each cell value
      R.map(({ content: { $t } }) => $t),
    )(cells)

    const data = R.pipe(
      // Filter header cells out
      R.filter(({ gs$cell: { row } }) => Number(row) !== 1),
      // Extract each cell value
      R.map(({ content: { $t } }) => $t),
      // Convert string booleans to real ones
      // eslint-disable-next-line no-nested-ternary
      R.map(value => (value === 'TRUE' ? true : value === 'FALSE' ? false : value)),
      // Convert dashed values to `null`
      R.map(value => (value === '-' ? null : value)),
      // Split into rows
      R.splitEvery(dataProps.length),
      // Transform rows into objects
      R.map(R.zipObj(dataProps)),
    )(cells)

    return data
  } catch (err) {
    console.error(now(), `[helpers/normalizeGoogleSheetData()] ${err}`)

    return []
  }
}

module.exports = normalizeGoogleSheetData
