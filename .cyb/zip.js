/**
 * =================================
 * @2018 塞伯坦-CYB前端模块化工程构建工具
 * https://github.com/jd-cyb/cyb-cli
 * =================================
 */

/**
 * ---------------------------------
 * 压缩dist目录并生成zip文件
 * ---------------------------------
 */

const fs = require('fs')
const path = require('path')
const zip = require('gulp-zip')
const vfs = require('vinyl-fs')
const async = require('async')
const fancyLog = require('fancy-log')
const chalk = require('chalk')
const config = require('./lib/fezconfig')
const ora = require('ora')

module.exports = () => {

  fancyLog(chalk.magenta('Start zip...'))

  const spinner = ora('启动 zip 压缩dist目录代码...').start()

  function zipDist(cb) {
    vfs.src(`${config.paths.dist.dir}/**/*`)
      .pipe(zip('dist.zip'))
      .pipe(vfs.dest('./'))
      .on('end', () => {
        spinner.succeed(chalk.green('成功生成 dist.zip'))
        cb()
      })
  }

  function taskZip(cb) {
    const distDir = fs.existsSync(config.paths.dist.dir)

    if (distDir) {
      return zipDist(cb)
    } else {
      spinner.stop()
      fancyLog(chalk.red('未找到dist发布目录！'))
      cb()
    }
  }

  async.series([
    function(next) {
      taskZip(next)
    }
  ], function(err) {
    if (err) {
      throw new Error(err)
    }
    fancyLog(chalk.magenta('Completed zip.'))
  })
}
