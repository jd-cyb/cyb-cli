/**
 * =================================
 * @2018 塞伯坦-CYB前端模块化工程构建工具
 * https://github.com/jd-cyb/cyb-cli
 * =================================
 */

/**
 * ---------------------------------
 * 获取.babelrc配置
 * ---------------------------------
 */

let babelrc = require('rc')('babel', {})
delete babelrc._
delete babelrc.config
delete babelrc.configs

module.exports = babelrc
