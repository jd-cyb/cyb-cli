/**
 * =================================
 * @2018 塞伯坦-CYB前端模块化工程构建工具
 * https://github.com/jd-cyb/cyb-cli
 * =================================
 */

const path = require('path')
const ora = require('ora')
const home = require('user-home')
const download = require('download-git-repo')
const fancyLog = require('fancy-log')
const chalk = require('chalk')
const request = require('request')
const semver = require('semver')
const fs = require('fs')
const rm = require('rimraf').sync

const templatePath = path.join(home, '.cyb-init-template')

const downLoadGithub = () => {
  return new Promise((resolve, reject) => {
    const spinner = ora('Download template from https://github.com/jd-cyb/cyb-init-template ...').start()

    download('jd-cyb/cyb-init-template', templatePath, function(error) {
      if (!error) {
        resolve()
        spinner.stop()
      } else {
        reject()
        spinner.fail('下载失败，请检查网络是否连通！并重新执行命令。')
      }
    })
  })
}

const checkVersion = () => {
  return new Promise((resolve, reject) => {
    request({
      url: 'https://registry.npmjs.org/cyb-init-template',
      timeout: 10000
    }, (err, res, body) => {
      if (!err && res.statusCode === 200) {
        const latestVersion = JSON.parse(body)['dist-tags'].latest
        const localVersion = require(path.join(templatePath, './package.json')).version

        if (semver.lt(localVersion, latestVersion)) {
          resolve()
        } else {
          reject()
        }
      } else {
        fancyLog(chalk.red('获取信息失败，请检查网络是否连通！并重新执行命令。'))
      }
    })
  })
}

const checkTemplatePath = () => {
  return new Promise((resolve, reject) => {

    const stats = fs.existsSync(templatePath)

    if (stats) {
      checkVersion()
        .then(() => {
          rm(templatePath)
          return downLoadGithub()
        }, () => {
          resolve(templatePath)
        })
        .then(() => {
          resolve(templatePath)
        })
        .catch(() => {
          reject()
        })
    } else {
      downLoadGithub()
        .then(() => {
          resolve(templatePath)
        })
        .catch(() => {
          reject()
        })
    }
  })
}

module.exports = checkTemplatePath
