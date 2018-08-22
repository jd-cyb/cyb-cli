/**
 * =================================
 * @2018 塞伯坦-CYB前端模块化工程构建工具
 * https://github.com/jd-cyb/cyb-cli
 * =================================
 */

module.exports = function formatStats(dir) {
  const fs = require('fs')
  const rd = require('rd')
  const path = require('path')
  const zlib = require('zlib')
  const chalk = require('chalk')
  const ui = require('cliui')({ width: 80 })

  const seenNames = new Map()
  const isJS = val => /\.js$/.test(val)
  const isCSS = val => /\.css$/.test(val)
  const isMinJS = val => /\.min\.js$/.test(val)

  const readDistDir = rd.readSync(dir)
  let assets = []
  readDistDir.filter(file => {
    const stats = fs.statSync(file)
    if (stats.isFile()) {
      assets.push({
        name: path.relative(path.join(process.cwd(), dir), file),
        size: stats.size
      })
    }
  })

  assets = assets
    .filter(a => {
      if (seenNames.has(a.name)) {
        return false
      }
      seenNames.set(a.name, true)
      return isJS(a.name) || isCSS(a.name)
    })
    .sort((a, b) => {
      if (isJS(a.name) && isCSS(b.name)) return -1
      if (isCSS(a.name) && isJS(b.name)) return 1
      if (isMinJS(a.name) && !isMinJS(b.name)) return -1
      if (!isMinJS(a.name) && isMinJS(b.name)) return 1
      return b.size - a.size
    })

  function formatSize(size) {
    return (size / 1024).toFixed(2) + ' kb'
  }

  function getGzippedSize(asset) {
    const filepath = path.join(process.cwd(), dir, asset.name)
    const buffer = fs.readFileSync(filepath)
    return formatSize(zlib.gzipSync(buffer).length)
  }

  function makeRow(a, b, c) {
    return `  ${a}\t    ${b}\t ${c}`
  }

  ui.div(
    makeRow(
      chalk.cyan.bold(`File`),
      chalk.cyan.bold(`Size`),
      chalk.cyan.bold(`Gzipped`)
    ) + `\n\n` +
    assets.map(asset => makeRow(
      /js$/.test(asset.name) ?
      chalk.green(path.join(dir, asset.name)) :
      chalk.blue(path.join(dir, asset.name)),
      formatSize(asset.size),
      getGzippedSize(asset)
    )).join(`\n`)
  )

  return `${ui.toString()}\n\n  ${chalk.gray(`Images and other types of static assets omitted.`)}\n`
}
