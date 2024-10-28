const fs = require('fs')

async function dirCheck(path) {
  if (!fs.existsSync(`${path}`)) {
    fs.mkdirSync(path)
  }
}

module.exports = { dirCheck }
