const { createCanvas, Image } = require('canvas')
const fs = require('fs')
const { greenSuccess, logReset } = require('../consoleColor')

function roundedImage(ctx, x, y, width, height, radius) {
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.lineTo(x + width - radius, y)
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
  ctx.lineTo(x + width, y + height - radius)
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
  ctx.lineTo(x + radius, y + height)
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
  ctx.lineTo(x, y + radius)
  ctx.quadraticCurveTo(x, y, x + radius, y)
  ctx.closePath()
}

async function canvasFrame(path, reso, model, config) {
  const sptPath = path.split('/').slice(0, -1)
  const dirPath = sptPath.join('/')
  const outPath = `${dirPath}/marked`
  const fileName = `${path.split('/').pop().split('.')[0]}_marked.jpeg`

  let canvas = createCanvas(parseInt(reso[0]) + 100, parseInt(reso[1]) + 350)

  if (reso[0] < reso[1]) {
    canvas = createCanvas(parseInt(reso[0]) + 100, parseInt(reso[1]) + 300)
  }

  const ctx = canvas.getContext('2d')

  ctx.fillStyle = '#2e2f2f'
  ctx.fillRect(0, 0, reso[0] + 100, reso[1] + 350)

  let pos1 = [60, canvas.height - 190]
  let pos2 = [60, canvas.height - 105]
  let pos3 = [60, canvas.height - 40]

  if (reso[0] < reso[1]) {
    pos1 = [60, canvas.height - 150]
    pos2 = [60, canvas.height - 90]
    pos3 = [60, canvas.height - 40]
  }

  var img = new Image()
  img.src = `data:image/jpeg;base64,${fs.readFileSync(path).toString('base64')}`

  ctx.save()
  roundedImage(ctx, 50, 50, canvas.width - 100, Number(reso[1]), 20)
  ctx.clip()

  console.log(reso[0], reso[1])

  if (reso[0] < reso[1]) {
    ctx.translate(50, reso[1] + 50)
    ctx.rotate(-(90 * Math.PI) / 180)
    ctx.drawImage(img, 0, 0)
  } else {
    ctx.drawImage(img, 50, 50)
  }

  ctx.restore()

  // Date w/ title
  if (reso[0] < reso[1]) {
    ctx.font = `50px ${config.fonts.titleFont}`
  } else {
    ctx.font = `70px ${config.fonts.titleFont}`
  }
  ctx.fillStyle = config.colors.titleColor
  ctx.fillText(model[3], pos1[0], pos1[1])

  // Camera Model
  if (reso[0] < reso[1]) {
    ctx.font = `30px ${config.fonts.modelFont}`
  } else {
    ctx.font = `45px ${config.fonts.modelFont}`
  }
  ctx.fillStyle = config.colors.modelColor
  ctx.fillText(`${model[0]} | ${model[1]}`, pos2[0], pos2[1])

  // Camera Settings
  if (reso[0] < reso[1]) {
    ctx.font = `30px ${config.fonts.settingFont}`
  } else {
    ctx.font = `45px ${config.fonts.settingFont}`
  }
  ctx.fillStyle = config.colors.settingColor
  ctx.fillText(model[2], pos3[0], pos3[1])

  // Watermark
  const wtmText2 = config.watermark

  if (reso[0] < reso[1]) {
    ctx.font = `Bold 100px ${config.fonts.waterMarkFonts}`
  } else {
    ctx.font = `Bold 120px ${config.fonts.waterMarkFonts}`
  }
  ctx.fillStyle = config.colors.watermarkColors
  const pos5 = [
    canvas.width - ctx.measureText(wtmText2).width - 50,
    canvas.height - 75,
  ]
  ctx.fillText(wtmText2, pos5[0], pos5[1])

  const buffer = canvas.toBuffer('image/jpeg')
  if (!fs.existsSync(outPath)) {
    fs.mkdirSync(outPath)
    fs.writeFileSync(`${outPath}/${fileName}`, buffer)
  } else {
    fs.writeFileSync(`${outPath}/${fileName}`, buffer)
  }

  console.log(
    `${greenSuccess}Added watermarked to ${fileName} successfully!${logReset}`
  )
}

module.exports = canvasFrame
