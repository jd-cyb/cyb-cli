/**
 * =================================
 * @2018 塞伯坦-CYB前端模块化工程构建工具
 * https://github.com/jd-cyb/cyb-cli
 * =================================
 */

const path = require('path')
const inquirer = require('inquirer')
const create = require('./lib/create')
const checkTemplatePath = require('./lib/init-temp-path')

module.exports = () => {
  checkTemplatePath()
    .then((templatePath) => {
      inquirer.prompt([...(require(path.join(templatePath, './config')).prompts)])
        .then(answers => {
          create(answers, templatePath)
        }).catch((error) => {
          if (error) {
            throw new Error(error)
          }
        })
    })
}
