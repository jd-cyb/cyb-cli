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

const fontText = config.fontmin.text

const minFonts = (answers) => {
  fancyLog(chalk.magenta('Start fontmin...'))

  let creatFiles = []

  const cssFilter = filter('**/*.css', {
    restore: true
  })

  vfs.src(`./src/static/ttf/*.ttf`)
    .pipe(fontMin({
      text: fontText,
      quiet: true,
      fontPath: '../fonts/'
    }))
    .pipe(cssFilter)
    .pipe(rename({ extname: `.${answers.style}` }))
    .pipe(cssFilter.restore)
    .pipe(vfs.dest('./src/static/fonts/'))
    .on('data', (file) => {
      creatFiles.push(path.basename(file.history[1].replace('.css', `.${answers.style}`)))
    })
    .on('end', () => {
      for (let item of creatFiles) {
        fancyLog(chalk.green(`Create succeed: src/static/fonts/${item}`))
      }
      fancyLog(chalk.magenta('Completed fontmin.'))
    })
}

module.exports = () => {

  if (!fontText) {
    fancyLog.error(chalk.red('未在配置文件中配置文本信息。'))
  } else {
    inquirer.prompt([{
        type: 'list',
        name: 'style',
        message: '选择样式编译器：',
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
