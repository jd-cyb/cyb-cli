/**
 * =================================
 * @2018 塞伯坦-CYB前端模块化工程构建工具
 * https://github.com/jd-cyb/cyb-cli
 * =================================
 */

/**
 * ---------------------------------
 * 压缩src/static/images目录中的图片
 * ---------------------------------
 */

const path = require('path')
const fs = require('fs')
const vfs = require('vinyl-fs')
const gulpCache = require('gulp-cache')
const gulpif = require('gulp-if')
const gulpImagemin = require('gulp-imagemin')
const imagemin = require('imagemin');
const pngquant = require('imagemin-pngquant')
const imageminMozjpeg = require('imagemin-mozjpeg')
const imageminGifsicle = require('imagemin-gifsicle')
const async = require('async')
const fancyLog = require('fancy-log')
const chalk = require('chalk')
const inquirer = require('inquirer')
const program = require('commander')
const ora = require('ora')
const config = require('./lib/fezconfig')

function imageMinAll(answers) {
  fancyLog(chalk.magenta('Start imagemin...'))

  vfs.src(path.join(config.paths.src.img, '**/*.{png,jpg,jpeg,gif}'))
    .pipe(gulpCache(gulpImagemin([
      pngquant(config.imagemin.png),
      imageminMozjpeg(Object.assign(config.imagemin.jpg, {
        quality: answers.quality || 85
      })),
      imageminGifsicle(Object.assign(config.imagemin.gif, {
        optimizationLevel: answers.optimizationLevel || 1
      }))
    ], {
      verbose: true
    })))
    .pipe(vfs.dest(config.paths.src.img))
    .on('end', () => {
      fancyLog(chalk.green('Completed imagemin.'))
    })
}

function imageMinCustom(answers) {
  const spinner = ora(chalk.yellow('Compressing images...')).start();

  imagemin([...program.args], './', {
    plugins: [
      pngquant(config.imagemin.png),
      imageminMozjpeg(Object.assign(config.imagemin.jpg, {
        quality: answers.quality || 85
      })),
      imageminGifsicle(Object.assign(config.imagemin.gif, {
        optimizationLevel: answers.optimizationLevel || 1
      }))
    ]
  }).then(files => {
    if (files.length === 0) return spinner.succeed(chalk.red('No images'))
    for (let item of files) {
      spinner.succeed(chalk.green(`Images have been compressed in ${item.path}`))
    }
  })
}

module.exports = () => {
  if (program.args.length > 0) {
    const imageType = {
      png: false,
      jpg: false,
      gif: false
    }

    for (let item of program.args) {
      let imgParse = path.parse(item)
      if (imgParse.ext === '.png') Object.assign(imageType, { png: true })
      if (imgParse.ext === '.jpg' || imgParse.ext === '.jpeg') Object.assign(imageType, { jpg: true })
      if (imgParse.ext === '.gif') Object.assign(imageType, { gif: true })
    }
    inquirer.prompt([...(imageType.jpg ? [{
          type: 'input',
          name: 'quality',
          message: '请填写jpg/jpeg压缩质量：（1～100）',
          default: config.imagemin.jpg.quality
        }] : []),
        ...(imageType.gif ? [{
          type: 'input',
          name: 'optimizationLevel',
          message: '请填写Gif压缩质量：（1～3）',
          default: config.imagemin.gif.optimizationLevel
        }] : [])
      ])
      .then(answers => {
        imageMinCustom(answers)
      }).catch(error => {
        if (error) {
          throw new Error(error)
        }
      })
  } else {

    const checkFezConfigFile = fs.existsSync(path.join(process.cwd(), './fez.config.js'))
    const checkCybConfigFile = fs.existsSync(path.join(process.cwd(), './cyb.config.js'))

    if (!checkFezConfigFile && !checkCybConfigFile) return console.log(chalk.red('压缩所有图片，请在项目根目录下执行 imagemin 命令'))

    inquirer.prompt([{
        type: 'input',
        name: 'quality',
        message: '请填写jpg/jpeg压缩质量：（1～100）',
        default: config.imagemin.jpg.quality
      }, {
        type: 'input',
        name: 'optimizationLevel',
        message: '请填写Gif压缩质量：（1～3）',
        default: config.imagemin.gif.optimizationLevel
      }])
      .then(answers => {
        imageMinAll(answers)
      }).catch(error => {
        if (error) {
          throw new Error(error)
        }
      })
  }
}
