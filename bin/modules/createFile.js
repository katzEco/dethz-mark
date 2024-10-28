const fs = require('fs')

const { dirCheck } = require('./dirCheck')
const { greenSuccess, logReset } = require('../consoleColor')

async function CreateImage(path, buffer) {
  const sptPath = path.split('/').slice(0, -3)
  const dirPath = sptPath.join('/')
  const outPath = `${dirPath}/wtm/${path.split('/').slice(0, -1).pop()}`
  const fileName = `fe6e6f-${path
    .split('/')
    .pop()
    .split('.')[0]
    .split('-')
    .pop()}.jpeg`

  await dirCheck(`${dirPath}/wtm`)
  await dirCheck(outPath)

  fs.writeFileSync(`${outPath}/${fileName}`, buffer)

  console.log(
    `${greenSuccess}Added watermarked to ${fileName} successfully!${logReset}`
  )
}

module.exports = { CreateImage }
