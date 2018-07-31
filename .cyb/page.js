/**
 * =================================
 * @2018 塞伯坦-CYB前端模块化工程构建工具
 * https://github.com/jd-cyb/cyb-cli
 * =================================
 */

const mkdirp = require('mkdirp')
const path = require('path')
const ora = require('ora')
const download = require('download-git-repo')
const fancyLog = require('fancy-log')
const chalk = require('chalk')
const inquirer = require('inquirer')
const Handlebars = require('handlebars')
const cons = require('consolidate')
const fs = require('fs')
const del = require('del')

const checkTemplatePath = require('./lib/init-temp-path')

// register handlebars helper
Handlebars.registerHelper('if_eq', function(a, b, opts) {
  return a === b ?
    opts.fn(this) :
    opts.inverse(this)
})

const createPage = (answers, templatePath) => {
  return new Promise((resolve, reject) => {
    const tempPath = templatePath

    cons.handlebars(`${tempPath}/template/src/views/index/index.html`, { name: answers.pageName, pagetype: 'page', style: answers.style })
      .then((content) => {

        const htmlPath = path.join(process.cwd(), 'src/views/', answers.pageName)

        mkdirp.sync(htmlPath)

        fs.writeFile(`${htmlPath}/index.html`, content, (err) => {
          fancyLog(chalk.green(`Create succeed: src/views/${answers.pageName}/index.html`))
        })

        return cons.handlebars(`${tempPath}/template/src/views/index/index.js`, {})
      })
      .then((content) => {

        const jsPath = path.join(process.cwd(), 'src/views/', answers.pageName)

        mkdirp.sync(jsPath)

        fs.writeFile(`${jsPath}/index.js`, content, (err) => {
          fancyLog(chalk.green(`Create succeed: src/views/${answers.pageName}/index.js`))
        })

        return cons.handlebars(`${tempPath}/template/src/static/styles/index.scss`, {})
      })
      .then((content) => {
        fs.writeFile(`${path.join(process.cwd(),'src/static/styles/')}/${answers.pageName}.${answers.style}`, content, (err) => {
          fancyLog(chalk.green(`Create succeed: src/static/styles/${answers.pageName}.${answers.style}`))
          resolve()
        })
      })
      .catch((error) => {
        if (error) throw new Error(error)
        reject()
      })
  })
}

module.exports = () => {

  checkTemplatePath()
    .then((templatePath) => {
      inquirer.prompt([{
          type: 'input',
          name: 'pageName',
          message: '请填写页面目录名（字母或数字组合）',
          default: 'page-demo'
        }, {
          type: 'list',
          name: 'style',
          message: '请选择样式编译',
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
          createPage(answers, templatePath)
        })
        .catch((error) => {
          if (error) {
            throw new Error(error)
          }
        })
    })
}
