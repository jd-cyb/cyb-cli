/**
 * =================================
 * @2018 塞伯坦-CYB前端模块化工程构建工具
 * https://github.com/jd-cyb/cyb-cli
 * =================================
 */

/**
 * ---------------------------------
 * 创建运行环境测试dist上线目录中的代码
 * ---------------------------------
 */

const bs = require('browser-sync')
const fs = require('fs')
const del = require('del')
const vfs = require('vinyl-fs')
const async = require('async')
const fancyLog = require('fancy-log')
const chalk = require('chalk')
const config = require('./lib/fezconfig')
const qrCode = require('./lib/zindex')
const mockMiddleware = require('./lib/mock-middleware')
const proxy = require('http-proxy-middleware')

module.exports = () => {
  bs.create('cyb test')

  fancyLog(chalk.cyan('Start test...'))
  /**
   * 清除 test 目录
   **/
  function delTest(cb) {
    del([config.paths.test.dir])
      .then(() => {
        fancyLog(chalk.yellow('Initialization test folder...'))
        cb()
      })
  }

  /**
   * 测试环境生成二维码方便在移动端浏览测试
   */
  function qrcodeViewHtml(cb) {
    qrCode(config.paths.test.html)
      .then(() => {
        fancyLog(chalk.yellow('Find all html files...'))
        cb()
      })
  }

  /**
   * 拷贝 dist 目录下所有文件到测试目录
   */
  function copyDistToTest(cb) {

    vfs.src(`${config.paths.dist.dir}/**/*`, {
        base: config.paths.dist.dir
      })
      .pipe(vfs.dest(config.paths.test.dir))
      .on('end', () => {
        fancyLog(chalk.yellow('Copy dist to test folder...'))
        cb()
      })
  }

  /**
   * 启动 browsersync
   * 配置参考：http://www.browsersync.cn/docs/options/
   */
  function startServer(cb) {
    let proxyMiddleware = []
    if (Object.prototype.toString.call(config.proxy) === "[object Array]") {
      for (let item of config.proxy) {
        let proxyItem = proxy(item.url, item.config)
        proxyMiddleware.push(proxyItem)
      }
    } else if (Object.prototype.toString.call(config.proxy) === "[object Object]") {
      let proxyItem = proxy(config.proxy.url, config.proxy.config)
      proxyMiddleware.push(proxyItem)
    }
    bs.init(Object.assign({
      //在Chrome浏览器中打开网站
      // open: "external",
      // browser: "google chrome",
      socket: {
        namespace: `/cyb-cli-test-${config.projectName}`
      },
      server: {
        baseDir: config.paths.test.dir,
        middleware: [...(mockMiddleware()), ...(proxyMiddleware)]
      },
      ui: {
        port: 6700
      },
      port: 8080,
      startPath: '/',
      notify: { //自定制livereload 提醒条
        styles: [
          "margin: 0",
          "padding: 5px 10px",
          "position: fixed",
          "font-size: 14px",
          "z-index: 9999",
          "bottom: 0px",
          "right: 0px",
          "border-radius: 0",
          "border-top-left-radius: 8px",
          "background-color: rgba(0,0,0,0.5)",
          "color: white",
          "text-align: center"
        ]
      }
    }, config.browsersync.test.options))
    cb()
  }

  const distDir = fs.existsSync(config.paths.dist.dir)
  if (distDir) {
    async.series([
      function (next) {
        delTest(next)
      },
      function (next) {
        copyDistToTest(next)
      },
      function (next) {
        qrcodeViewHtml(next)
      },
      function (next) {
        startServer(next)
      }
    ], function (err) {
      if (err) {
        throw new Error(err);
      }
      fancyLog(chalk.green('Enter the local test environment...'))
    })
  } else {
    fancyLog(chalk.red('No dist folder.'))
  }
}
