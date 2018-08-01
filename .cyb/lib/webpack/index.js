/**
 * =================================
 * @2018 塞伯坦-CYB前端模块化工程构建工具
 * https://github.com/jd-cyb/cyb-cli
 * =================================
 */

const glob = require('glob')
const fancyLog = require('fancy-log')
const chalk = require('chalk')
const path = require('path')
const webpack = require('webpack')
const merge = require('webpack-merge')
const config = require('../fezconfig')
const outputPath = require('./output-path')

const webpackGlob = () => {
  return new Promise((resolve, reject) => {
    glob(path.join(process.cwd(), '**/webpack.config*.js'), (error, files) => {
      let webpackConfigGlob = {}
      files.map((file) => {
        webpackConfigGlob = merge(webpackConfigGlob, require(file))
      })
      resolve(webpackConfigGlob)
    })
  })
}

module.exports = {
  /**
   * 研发任务
   */
  dev() {
    try {
      return new Promise((resolve, reject) => {
        process.env.NODE_ENV = 'development'
        webpackGlob().then((webpackGlobData) => {
          let webpackConfig = merge(config.webpack.config, webpackGlobData, require('./config.base'), require('./config.dev'))
          // console.log(JSON.stringify(webpackConfig))
          glob(path.join(process.cwd(), config.paths.src.appJs, '*/index.js'), (error, files) => {
            //获取所有JS入口
            files.map((file) => {
              const source_name = path.dirname(file).split('/').pop()
              webpackConfig.entry[outputPath.js(source_name)] = ['webpack/hot/dev-server', 'webpack-hot-middleware/client?reload=true', file]
            })

            let compiler = webpack(webpackConfig)

            const watching = compiler.watch({
              // watchOptions 示例
              aggregateTimeout: 300,
              poll: undefined
            }, (err, stats) => {
              //致命的 wepback 错误（配置出错等）
              if (err) throw err

              //编译错误（缺失的 module，语法错误等）
              const info = stats.toJson()
              // info.errors 错误详情
              if (stats.hasErrors()) {
                fancyLog.error(chalk.red(info.errors))
              }
            });

            resolve({
              compiler: compiler,
              webpackConfig: webpackConfig
            })
          })
        })

      })
    } catch (error) {
      if (error) {
        throw new Error(error)
      }
    }
  },

  /**
   * 生产任务
   */
  dist() {
    try {
      return new Promise((resolve, reject) => {
        process.env.NODE_ENV = 'production'

        webpackGlob().then((webpackGlobData) => {
          let webpackConfig = merge(config.webpack.config, webpackGlobData, require('./config.base'), require('./config.dist'))

          /**
           * 合并自定义vendor脚本
           */
          for (let item of config.webpack.extract.js) {
            webpackConfig.optimization.splitChunks.cacheGroups[`vendor-webpack-${item.target}`] = {
              name: path.join(outputPath.js(), `vendor-webpack-${item.target}`),
              chunks: 'all',
              test: function(module) {
                return (
                  module.resource &&
                  new RegExp(`node_modules\/(${item.chunk.join('|')})\/(.*)\.js$`).test(module.resource)
                );
              }
            }
          }

          glob(path.join(process.cwd(), config.paths.src.appJs, '*/index.js'), (error, files) => {

            //获取所有js入口
            files.map((file) => {
              const source_name = path.dirname(file).split('/').pop()
              webpackConfig.entry[outputPath.js(source_name)] = file
            })

            webpack(webpackConfig, function(err, stats) {
              //致命的 wepback 错误（配置出错等）
              if (err) throw err

              //编译错误（缺失的 module，语法错误等）
              // const info = stats.toJson()
              // info.errors 错误详情
              if (stats.hasErrors()) {
                fancyLog.error(chalk.red('语法错误、或缺失module'))
              }

              // //编译告警
              // if (stats.hasWarnings()) {
              //   fancyLog.warn(info.warnings)
              // }

              resolve()
            })
          })
        })


      })
    } catch (error) {
      if (error) {
        throw new Error(error)
      }
    }

  }
}
