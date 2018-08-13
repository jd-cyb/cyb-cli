/**
 * =================================
 * @2018 塞伯坦-CYB前端模块化工程构建工具
 * https://github.com/jd-cyb/cyb-cli
 * =================================
 */

/**
 * ---------------------------------
 * 研发任务
 * ---------------------------------
 */

const path = require('path')
const fs = require('fs')
const fancyLog = require('fancy-log')
const chalk = require('chalk')
const del = require('del')
const globWatcher = require('glob-watcher')
const vfs = require('vinyl-fs')
const injectString = require('gulp-inject-string')
const gulpReplace = require('gulp-replace')
const mainBowerFiles = require('main-bower-files')
const filter = require('gulp-filter')
const flatten = require('gulp-flatten')
const inject = require('gulp-inject')
const lazypipe = require('lazypipe')
const es = require('event-stream')
const rename = require('gulp-rename')
const gulpif = require('gulp-if')
const less = require('gulp-less')
const sass = require('gulp-sass')
const stylus = require('gulp-stylus')
const postcss = require('gulp-postcss')
const postcssAutoprefixer = require('autoprefixer')
const postcssPxtorem = require('postcss-pxtorem')
const plumber = require('gulp-plumber')
const notify = require('gulp-notify')
const buffer = require('vinyl-buffer')
const sourcemaps = require('gulp-sourcemaps')
const bs = require('browser-sync')
const webpackDevMiddleware = require('webpack-dev-middleware')
const webpackHotMiddleware = require('webpack-hot-middleware')
const async = require('async')
const glob = require('glob')
const config = require('./lib/fezconfig')
const zIndex = require('./lib/zindex')
const compileJs = require('./lib/webpack')

module.exports = () => {
  fancyLog(chalk.magenta('Start dev...'))

  bs.create()

  /**
   * 调用browsersync自动刷新浏览器
   */
  const reloadHandler = () => {
    config.browsersync.dev.available && bs.reload()
  }

  /**
   * 通用复制模块
   */
  const copyHandler = (type, file = '**/*') => {
    return new Promise((resolve, reject) => {
      vfs.src(path.join(process.cwd(), config.paths.src[type], file), {
          base: config.paths.src.dir
        })
        .pipe(plumber({
          errorHandler: notify.onError("Error: <%= error.message %>")
        }))
        .pipe(vfs.dest(config.paths.dev.dir))
        .on('end', () => {
          reloadHandler()
          resolve()
        })
    })
  }

  /**
   * postcss插件配置
   */
  const postcssOption = [postcssAutoprefixer(Object.assign({}, config.style.autoprefixerOptions))]

  /**
   * 检测bower是否可用
   */
  const bowerAvailable = () => {

    if (!config.useInject.vendor.available) return false
    if (!fs.existsSync(path.join(process.cwd(), 'bower_components'))) return false
    if (mainBowerFiles().length <= 0) return false

    return true
  }

  /**
   * 删除开发目录
   */
  function delDev(cb) {
    return del([config.paths.dev.dir])
      .then(() => {
        fancyLog(chalk.yellow('初始化研发环境...'))
        cb()
      })
  }

  /**
   * 复制图片到研发目录
   */
  function copyImages(cb) {
    copyHandler('img')
      .then(() => {
        fancyLog(chalk.yellow('处理图片到研发目录...'))
        cb()
      })
  }

  /**
   * 复制公共脚本到研发目录
   */
  function copyLib(cb = () => {}) {
    copyHandler("common")
      .then(() => {
        fancyLog(chalk.yellow('处理common公共Javascript脚本到研发目录...'))
        cb()
      })
  }

  /**
   * 复制字体到研发目录
   */
  function copyFonts(cb) {
    copyHandler('fonts')
      .then(() => {
        fancyLog(chalk.yellow('处理字体文件到研发目录...'))
        cb()
      })
  }

  /**
   * 复制自定义文件到研发目录
   */
  function copyCustom(cb = () => {}) {
    copyHandler('custom')
      .then(() => {
        fancyLog(chalk.yellow('处理custom自定义文件到研发目录...'))
        cb()
      })
  }

  /**
   * 复制vendor文件到研发目录
   */
  function copyVendor(cb = () => {}) {
    copyHandler('vendor')
      .then(() => {
        fancyLog(chalk.yellow('处理vendor文件到研发目录...'))
        cb()
      })
  }

  /**
   * 编译css
   */
  function compileCss(cb = () => {}) {
    if (glob.sync(`${config.paths.src.styles}/*.css`).length === 0) return cb()

    vfs.src(`${config.paths.src.styles}/*.css`)
      .pipe(plumber({
        errorHandler: notify.onError("Error: <%= error.message %>")
      }))
      //css中的rem转换
      .pipe(gulpif(
        config.useREM.css.available,
        postcss([
          postcssPxtorem(Object.assign({}, config.useREM.css.options))
        ])
      ))
      .pipe(postcss(postcssOption)) //添加CSS前缀
      .pipe(vfs.dest(config.paths.dev.css))
      .on('end', () => {
        reloadHandler()
        fancyLog(chalk.yellow(`编译Css文件...`))
        cb()
      })
  }

  /**
   * 编译less
   */
  function compileLess(cb = () => {}) {
    if (glob.sync(`${config.paths.src.styles}/*.less`).length === 0) return cb()

    vfs.src(`${config.paths.src.styles}/*.less`)
      .pipe(plumber({
        errorHandler: notify.onError("Error: <%= error.message %>")
      }))
      .pipe(sourcemaps.init())
      .pipe(less(Object.assign({
        relativeUrls: true //将网址编译成相对网址
      }, config.style.lessOptions)))
      .on('error', (error) => {
        fancyLog(error.message)
      })
      //css中的rem转换
      .pipe(gulpif(
        config.useREM.css.available,
        postcss([
          postcssPxtorem(Object.assign({}, config.useREM.css.options))
        ])
      ))
      .pipe(postcss(postcssOption)) //添加CSS前缀
      .pipe(sourcemaps.write())
      .pipe(vfs.dest(config.paths.dev.css))
      .on('end', () => {
        reloadHandler()
        fancyLog(chalk.yellow(`编译Less文件...`))
        cb()
      })
  }

  /**
   * 编译sass
   */
  function compileSass(cb = () => {}) {
    if (glob.sync(`${config.paths.src.styles}/*.{scss,sass}`).length === 0) return cb()

    vfs.src(`${config.paths.src.styles}/*.{scss,sass}`)
      .pipe(plumber({
        errorHandler: notify.onError("Error: <%= error.message %>")
      }))
      .pipe(sourcemaps.init())
      .pipe(sass(Object.assign({
        /**
         * ------- outputStyle 取值 ------
         * nested：嵌套缩进的css代码，它是默认值。
         * expanded：没有缩进的、扩展的css代码。
         * compact：简洁格式的css代码。
         * compressed：压缩后的css代码
         */
        outputStyle: 'compact'
      }, config.style.sassOptions)))
      .on('error', (error) => {
        fancyLog(error.message)
      })
      //css中的rem转换
      .pipe(gulpif(
        config.useREM.css.available,
        postcss([
          postcssPxtorem(Object.assign({}, config.useREM.css.options))
        ])
      ))
      .pipe(postcss(postcssOption)) //添加CSS前缀
      .pipe(sourcemaps.write())
      .pipe(vfs.dest(config.paths.dev.css))
      .on('end', () => {
        reloadHandler()
        fancyLog(chalk.yellow(`编译Sass文件...`))
        cb()
      })
  }

  /**
   * 编译stylus
   */
  function compileStylus(cb = () => {}) {
    if (glob.sync(`${config.paths.src.styles}/*.styl`).length === 0) return cb()

    vfs.src(`${config.paths.src.styles}/*.styl`)
      .pipe(plumber({
        errorHandler: notify.onError("Error: <%= error.message %>")
      }))
      .pipe(sourcemaps.init())
      .pipe(stylus(Object.assign({}, config.style.stylusOptions)))
      .on('error', (error) => {
        fancyLog(error.message)
      })
      //css中的rem转换
      .pipe(gulpif(
        config.useREM.css.available,
        postcss([
          postcssPxtorem(Object.assign({}, config.useREM.css.options))
        ])
      ))
      .pipe(postcss(postcssOption)) //添加CSS前缀
      .pipe(sourcemaps.write())
      .pipe(vfs.dest(config.paths.dev.css))
      .on('end', () => {
        reloadHandler()
        fancyLog(chalk.yellow(`编译Stylus文件...`))
        cb()
      })
  }

  /**
   * 复制bower文件到dev目录
   * 研发环境直接使用 bower 路径 不对文件作任何处理
   */
  function copyBowerFiles(cb) {
    if (!bowerAvailable()) return cb()

    const cssFilter = filter('**/*.css', {
      restore: true
    })

    vfs.src(mainBowerFiles(), {
        base: './'
      })
      .pipe(cssFilter)
      //css中的rem转换
      .pipe(gulpif(
        config.useREM.css.available,
        postcss([
          postcssPxtorem(Object.assign({}, config.useREM.css.options))
        ])
      ))
      .pipe(plumber({
        errorHandler: notify.onError("Error: <%= error.message %>")
      }))
      .pipe(cssFilter.restore)
      .pipe(vfs.dest(config.paths.dev.dir))
      .on('end', () => {
        fancyLog(chalk.yellow('处理Bower文件到研发目录...'))
        cb()
      })
  }

  const injectHtmlFiles = (htmlPath = path.join(process.cwd(), config.paths.src.html, '**/*.html')) => {
    return new Promise((resolve, reject) => {
      /**
       * 自动注入Bower库文件到html页面中
       */
      const injectBower = lazypipe()
        .pipe(() => {
          if (!bowerAvailable()) return buffer()

          return inject(vfs.src(mainBowerFiles(), {
            read: false
          }), {
            starttag: '<!-- inject:vendor:{{ext}} -->',
            name: "vendor",
            relative: true,
            ignorePath: '../../../',
            quiet: true
            // addRootSlash: true
          })
        })

      /**
       * 自动注入项目公共库文件到html页面中
       */
      const injectLib = lazypipe()
        .pipe(() => {
          return inject(vfs.src([`./dev/static/css/**/${config.useInject.common.css}*.css`, `./dev/common/**/*.js`, `!./dev/common/**/assign-*.js`], {
            read: false
          }), {
            starttag: '<!-- inject:common:{{ext}} -->',
            relative: true,
            ignorePath: '../../../dev/',
            quiet: true
            // addRootSlash: true
          })
        })

      const injectHtml = (es) => {
        return es.map((file, cb) => {
          const cateName = file.path.match(/((.*?)[\/|\\])*([^.]+).*/)[2]

          vfs.src(file.path)
            .pipe(plumber({
              errorHandler: notify.onError("Error: <%= error.message %>")
            }))
            .pipe(rename(cateName + '.html'))
            .pipe(gulpif(
              bowerAvailable(),
              injectBower()
            ))
            .pipe(gulpif(
              config.useInject.common.available,
              injectLib()
            ))
            .pipe(gulpif(
              config.useInject.page,
              inject(vfs.src([`./dev/common/**/assign*-${cateName}*.js`, `./dev/**/css/${cateName}.css`, `./dev/**/css/${cateName}/index.css`, `./dev/**/js/${cateName}.js`], {
                read: false
              }), {
                starttag: '<!-- inject:page:{{ext}} -->',
                relative: true,
                ignorePath: '../../../dev/',
                quiet: true
                // addRootSlash: true
              })
            ))
            //页面对应的JS脚本通过webpack保存在内存中不再实际生成保存在dev目录
            .pipe(injectString.after('<!-- inject:page:js -->', `\n<script src="static/js/${cateName}.js"></script>`))
            .pipe(vfs.dest(config.paths.dev.html))
            .on("end", () => {
              cb()
            })
        })
      }

      /**
       * 入口页面
       */
      const indexHtmlFilter = filter(`**/index.html`, {
        restore: true
      })

      vfs.src(htmlPath)
        .pipe(plumber({
          errorHandler: notify.onError("Error: <%= error.message %>")
        }))
        .pipe(indexHtmlFilter)
        .pipe(injectHtml(es))
        .pipe(indexHtmlFilter.restore)
        .pipe(vfs.dest(config.paths.dev.html))
        .on('end', () => {
          reloadHandler()
          resolve()
        })
    })
  }

  /**
   * 编译 html 文件
   */
  function handleHtml(cb) {
    injectHtmlFiles().then(() => {
      fancyLog(chalk.yellow('编译HTML并处理编译后的JS、CSS文件自动引用到HTML模板页面...'))
      cb()
    })
  }


  /**
   * 使用gulp监听文件改动
   */
  function watch(cb) {
    /**
     * 通用处理文件改动
     */
    const watchHandler = (type, file) => {
      const target = file.match(/^src[\/|\\](.*?)[\/|\\]/)[1]
      const pathParse = path.parse(file)
      if (target === "views") {
        if (pathParse.ext === '.html') {
          const removeFiles = file.match(/^src[\/|\\]views[\/|\\](.*?)[\/|\\]/)[1]
          /*监视页面*/
          if (type === 'removed') {
            del([`${config.paths.dev.dir}/**/${removeFiles}.html`, `${config.paths.dev.dir}/**/${removeFiles}.js`]).then(() => {
              setTimeout(function() {
                qrcodeViewHtml()
              }, 500)
            })
          } else if (type === 'add') {
            injectHtmlFiles(file).then(() => {
              setTimeout(function() {
                qrcodeViewHtml()
              }, 500)
            })
          } else {
            injectHtmlFiles(file)
          }
        } else if (pathParse.ext === '.css' && pathParse.name === 'index') {
          compileCss()
        } else if (pathParse.ext === '.less' && pathParse.name === 'index') {
          compileLess()
        } else if ((pathParse.ext === '.scss' || pathParse.ext === '.sass') && pathParse.name === 'index') {
          compileSass()
        } else if (pathParse.ext === '.styl' && pathParse.name === 'index') {
          compileStylus()
        }

      } else if (target === "common") {
        copyLib()
      } else if (target === "custom") {
        copyCustom()
      } else if (target === "vendor") {
        copyVendor()
      } else if (target === "static") {
        /*监视静态资源*/
        const staticFile = file.match(/^src[\/|\\]static[\/|\\](.*?)[\/|\\]/)[1]

        switch (staticFile) {
          case 'images':
            if (type === 'removed') {
              const tmp = `${config.paths.dev.img}/**/${pathParse.base}`

              del([tmp])
            } else {
              copyHandler('img', path.join('**/', path.basename(file)))
            }
            break

          case 'fonts':
            if (type === 'removed') {
              const tmp = `${config.paths.dev.fonts}/**/${pathParse.base}`

              del([tmp])
            } else {
              copyHandler('fonts', path.join('**/', path.basename(file)))
            }
            break
            /**
             * 此处注释掉
             * 公共脚本放入common目录
             * 业务脚本放在views目录
             */
            // case 'js':
            //     if (type === 'removed') {
            //         const tmp = file.replace('src/', 'dev/')
            //         del([tmp])
            //     } else {
            //         copyHandler('js', file)
            //     }
            //     break

          case 'styles':

            if (type === 'removed') {
              const tmp = `${config.paths.dev.css}/**/${pathParse.name}`

              del([tmp])
            } else {
              switch (pathParse.ext) {
                case '.css':
                  compileCss()
                  break
                case '.less':
                  compileLess()
                  break
                case '.scss':
                case '.sass':
                  compileSass()
                  break
                case '.styl':
                  compileStylus()
                  break
              }
            }
            break
        }
      }
    }

    const watcher = globWatcher([
      config.paths.src.dir + '/**/*'
    ], {
      ignored: /[\/\\]\./
    })

    watcher
      .on('change', (file) => {
        fancyLog(`${file} 已被修改`)
        watchHandler('changed', file)
      })
      .on('add', (file) => {
        fancyLog(`${file} 新文件已被添加`)
        watchHandler('add', file)
      })
      .on('unlink', (file) => {
        fancyLog(`${file} 已被删除`)
        watchHandler('removed', file)
      })

    cb()
  }

  /**
   * 研发环境生成二维码方便在移动端浏览测试
   */
  function qrcodeViewHtml(cb = () => {}) {
    zIndex()
      .then(() => {
        cb()
      })
  }

  /**
   * 处理JS并启动服务
   */
  function handleJs(cb) {
    /**
     * 启动 browsersync
     * 配置参考：http://www.browsersync.cn/docs/options/
     */
    const startServer = (webpackCompiled, cb) => {
      bs.init(Object.assign({
        //在Chrome浏览器中打开网站
        // open: "external",
        // browser: "google chrome",
        socket: {
          namespace: `/cyb-cli-dev-${config.projectName}`
        },
        server: {
          baseDir: config.paths.dev.dir,
          middleware: [
            webpackDevMiddleware(webpackCompiled.compiler, {
              publicPath: webpackCompiled.webpackConfig.output.publicPath,
              watchOptions: {
                ignored: /node_modules/
              },
              logLevel: 'silent',
              stats: {
                context: path.relative(__dirname, '../'),
                colors: true
              }
            }),
            webpackHotMiddleware(webpackCompiled.compiler)
          ]
        },
        ui: {
          port: 5050
        },
        port: 8080,
        startPath: '/',
        notify: { //提醒条样式
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
      }, config.browsersync.dev.options))
      fancyLog(chalk.yellow('启动本地研发服务器...'))
      cb()
    }

    fancyLog(chalk.yellow('编译打包Javascript...'))
    compileJs.dev()
      .then(result => {
        startServer(result, cb)
      })
      .catch(error => {
        console.log(error)
      })
  }

  /**
   * 研发任务
   * series 中的任务同步执行
   * parallel 中的任务异步执行
   */
  async.series([
    function(next) {
      delDev(next)
    },
    function(next) {
      async.parallel([
        function(cb) {
          compileCss(cb)
        },
        function(cb) {
          compileLess(cb)
        },
        function(cb) {
          compileSass(cb)
        },
        function(cb) {
          compileStylus(cb)
        },
        function(cb) {
          copyImages(cb)
        },
        function(cb) {
          copyFonts(cb)
        },
        function(cb) {
          copyLib(cb)
        },
        function(cb) {
          copyCustom(cb)
        },
        function(cb) {
          copyVendor(cb)
        }
      ], function(error) {
        if (error) {
          throw new Error(error)
        }
        next()
      })
    },
    function(next) {
      async.parallel([
        function(cb) {
          copyBowerFiles(cb)
        },
        function(cb) {
          handleHtml(cb)
        }
      ], function(error) {
        if (error) {
          throw new Error(error)
        }
        next()
      })
    },
    function(next) {
      async.parallel([
        function(cb) {
          watch(cb)
        },
        function(cb) {
          qrcodeViewHtml(cb)
        },
        function(cb) {
          handleJs(cb)
        }
      ], function(error) {
        if (error) {
          throw new Error(error)
        }
        next()
      })
    }
  ], function(err) {
    if (err) {
      throw new Error(err)
    }
  })
}
