/**
 * =================================
 * @2018 塞伯坦-CYB前端模块化工程构建工具
 * https://github.com/jd-cyb/cyb-cli
 * =================================
 */

/**
 * ---------------------------------
 * 处理TTF字体生成网页字体
 * ---------------------------------
 */

const path = require('path')
const fontMin = require('gulp-fez-fontmin')
const fancyLog = require('fancy-log')
const chalk = require('chalk')
const filter = require('gulp-filter')
const rename = require('gulp-rename')
const vfs = require('vinyl-fs')
const async = require('async')
const inquirer = require('inquirer')
const config = require('./lib/fezconfig')

// let creatFiles = []

const isEmpty = (value) => {
  return (Array.isArray(value) && value.length === 0) || (Object.prototype.isPrototypeOf(value) && Object.keys(value).length === 0)
}

const taskFontmin = (answers, elem, cb) => {
  const cssFilter = filter('**/*.css', {
    restore: true
  })
  vfs.src(`./src/static/ttf/**/${elem.ttf}`)
    .pipe(fontMin({
      text: elem.text,
      verbose: true,
      cssExt: answers.style,
      fontPath: '../fonts/'
    }))
    .pipe(cssFilter)
    .pipe(rename({ extname: `.${answers.style}` }))
    .pipe(cssFilter.restore)
    .pipe(vfs.dest('./src/static/fonts/'))
    .on('end', () => {
      cb()
    })
}

const minFonts = (answers) => {
  fancyLog(chalk.magenta('Start fontmin...'))
  if (Object.prototype.toString.call(config.fontmin) === "[object Array]") {
    let index = 1
    for (let elem of config.fontmin) {
      taskFontmin(answers, {
        ttf: elem.ttf,
        text: elem.text
      }, () => {
        index++
        if (index === config.fontmin.length) {
          fancyLog(chalk.magenta('Completed fontmin.'))
        }
      })
    }
  } else if (Object.prototype.toString.call(config.fontmin) === "[object Object]") {
    taskFontmin(answers, {
      ttf: '*.ttf',
      text: config.fontmin.text
    }, () => {
      fancyLog(chalk.magenta('Completed fontmin.'))
    })
  }
}

module.exports = () => {
  if (isEmpty(config.fontmin)) {
    fancyLog.error(chalk.red('No fontmin text in cyb.config.js'))
  } else {
    inquirer.prompt([{
        type: 'list',
        name: 'style',
        message: 'Select styles compiler:',
        choices: [{
          name: 'Sass',
          value: 'scss',
          short: 'Sass',
        }, {
          name: 'Less',
          value: 'less',
          short: 'Less',
        }, {
          name: 'Stylus',
          value: 'styl',
          short: 'Stylus',
        }, {
          name: 'Css',
          value: 'css',
          short: 'Css',
        }],
      }])
      .then(answers => {
        minFonts(answers)
      })
      .catch((error) => {
        if (error) {
          throw new Error(error)
        }
      })
  }
}
