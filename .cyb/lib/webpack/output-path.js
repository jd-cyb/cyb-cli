/**
 * =================================
 * @2018 塞伯坦-CYB前端模块化工程构建工具
 * https://github.com/jd-cyb/cyb-cli
 * =================================
 */

const path = require('path')
const config = require('../fezconfig')

module.exports = {
  js(pathName = '') {
    return path.join('static/js/', pathName)
  },
  css(pathName = '') {
    return path.join('static/css/', pathName)
  },
  images(pathName = '') {
    return path.join('/static/images/', pathName)
  },
  fonts(pathName = '') {
    return path.join('/static/fonts/', pathName)
  },
  media(pathName = '') {
    return path.join('/static/media/', pathName)
  },
  dev(pathName = '') {
    return path.join(process.cwd(), config.paths.dev.dir)
  },
  dist(pathName = '') {
    return path.join(process.cwd(), config.paths.tmp.dir)
  }
}
