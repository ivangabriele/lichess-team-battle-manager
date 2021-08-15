async function waitFor(inMs) {
  return new Promise(resolve => setTimeout(resolve, inMs))
}

module.exports = waitFor
