const fs = require('fs')
const os = require('os')
const path = require('path')
const ExifParser = require('exif-parser')
const Fraction = require('fractional').Fraction

const lists = require('./ignored.json').ignored
const canvasFrame = require('./canvas/Frame')
const { redBan, logReset } = require('./consoleColor')

const canvasConfig = require('./canvasConfig')

function mark(folderPath, title) {
  const pattern = /\.(jpg|png|jpeg)$/i
  const configPath = path.join(os.homedir(), 'dMark.config.json')
  let config

  if (fs.existsSync(configPath)) {
    config = JSON.parse(fs.readFileSync(configPath).toString())
  } else {
    try {
      fs.writeFileSync(configPath, JSON.stringify(canvasConfig, null, 2))
    } catch (err) {
      console.error(`${redBan}Error${logReset}:`, err)
    }

    config = JSON.parse(fs.readFileSync(configPath).toString())
  }

  fs.readdirSync(folderPath).forEach((file) => {
    if (!lists.includes(file)) {
      if (pattern.test(file)) {
        const path = `${folderPath}/${file}`

        try {
          const data = fs.readFileSync(path)
          const parser = ExifParser.create(data)
          parser.enableSimpleValues(true)
          const result = parser.parse()

          // console.log(result.tags)

          const timeZone =
            result.tags.undefined.split(':').slice(0, -1)[0][0] == '+'
              ? Number(
                  result.tags.undefined
                    .split(':')
                    .slice(0, -1)[0]
                    .replace('+', '')
                )
              : -Number(
                  result.tags.undefined
                    .split(':')
                    .slice(0, -1)[0]
                    .replace('-', '')
                )

          let imgResolution

          if (result.tags.Orientation == 8) {
            imgResolution = [result.imageSize.height, result.imageSize.width]
          } else {
            imgResolution = [result.imageSize.width, result.imageSize.height]
          }

          const shutter = `1/${Math.ceil(
            Math.pow(2, result.tags.ShutterSpeedValue)
          )}`

          const imageLog = `ISO ${result.tags.ISO}  ${result.tags.FocalLength}mm  ƒ/${result.tags.FNumber}  ${shutter}`

          const dateConst = new Date(result.tags.DateTimeOriginal * 1000)

          let Hour = 0

          if (dateConst.getHours() - timeZone < 0) {
            Hour = 24 + (dateConst.getHours() - timeZone)
          } else {
            Hour = dateConst.getHours() - timeZone
          }

          const date = `${dateConst.toLocaleDateString()} - ${
            String(Hour).length < 2 ? `0${Hour}` : Hour
          }:${
            String(dateConst.getMinutes()).length < 2
              ? `0${dateConst.getMinutes()}`
              : dateConst.getMinutes()
          }`

          const model = [
            result.tags.Model,
            result.tags.LensModel.replace('f/', 'ƒ/'),
            imageLog,
            title,
            date,
          ]

          canvasFrame(path, imgResolution, model, config)
        } catch (error) {
          console.log(
            `${redBan}Error reading or parsing the image file${logReset}:`,
            error
          )
        }
      }
    }
  })
}

module.exports = mark
