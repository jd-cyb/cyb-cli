/**
 * =================================
 * @2018 塞伯坦-CYB前端模块化工程构建工具
 * https://github.com/jd-cyb/cyb-cli
 * =================================
 */

/**
 * ---------------------------------
 * 生产任务
 * ---------------------------------
 */

const path = require('path')
const svgSymbols = require('gulp-svg-symbols')
const svgmin = require('gulp-svgmin')
const svgSymbolsToJs = require('gulp-fez-svg-symbols-tojs')
const injectString = require('gulp-inject-string')
const gulpReplace = require('gulp-replace')
const fs = require('fs')
const fancyLog = require('fancy-log')
const chalk = require('chalk')
const mainBowerFiles = require('main-bower-files')
const filter = require('gulp-filter')
const flatten = require('gulp-flatten')
const inject = require('gulp-inject')
const lazypipe = require('lazypipe')
const es = require('event-stream')
const rename = require('gulp-rename')
const del = require('del')
const gulpif = require('gulp-if')
const less = require('gulp-less')
const sass = require('gulp-sass')
const stylus = require('gulp-stylus')
const postcss = require('gulp-postcss')
const autoprefixer = require('autoprefixer')
const postcssPxtorem = require('postcss-pxtorem')
const buffer = require('vinyl-buffer')
const uglify = require('gulp-uglify')
const htmlmin = require('gulp-htmlmin')
const usemin = require('gulp-usemin')
const minifyCSS = require('gulp-clean-css')
const RevAll = require('gulp-rev')
const RevReplace = require('gulp-rev-replace')
const revDel = require('gulp-rev-delete-original')
const concatJs = require('gulp-concat')
const concatCss = require('gulp-concat-css')
const concatOrder = require("gulp-fez-order")
const cdnify = require('gulp-fez-cdn')
const vfs = require('vinyl-fs')
const async = require('async')
const glob = require('glob')
const config = require('./lib/fezconfig')
const webp = require('./lib/webp')
const compileJs = require('./lib/webpack')

module.exports = () => {
  console.time('dist')
  fancyLog(chalk.cyan('Start dist...'))

  /**
   * postcss配置
   */
  const postcssOption = [autoprefixer(Object.assign({}, config.style.autoprefixerOptions))]


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
   * 清除 dist 目录
   **/
  function delDist(cb) {
    del([config.paths.dist.dir])
      .then(() => {
        fancyLog(chalk.magenta('清除dist目录。'))
        cb()
      })
  }

  /**
   * 合并SVG图标
   */
  function svgSymbol(cb) {
    if (!config.svgSymbol.available) return cb()

    vfs.src(path.join(process.cwd(), config.paths.src.svg, '**/*.svg'))
      .pipe(svgmin())
      .pipe(svgSymbols(Object.assign({}, config.svgSymbol.options)))
      .pipe(filter("**/*.svg"))
      .pipe(svgSymbolsToJs())
      .pipe(rename({
        extname: ".js"
      }))
      .pipe(vfs.dest(config.paths.tmp.common))
      .on('end', () => {
        fancyLog(chalk.green('完成编译合并SVG高清图片/图标。'))
        cb()
      })
  }

  /**
   * 处理图片
   **/
  function handleImages(cb) {
    vfs.src(path.join(process.cwd(), config.paths.src.img, '**/*'))
      .pipe(vfs.dest(config.paths.tmp.img))
      .on('end', () => {
        fancyLog(chalk.green('完成处理images目录中所有图片。'))
        cb()
      })
  }

  /**
   * 处理字体
   **/
  function handleFonts(cb) {
    if (!config.useMd5.available) return cb()

    vfs.src(path.join(process.cwd(), config.paths.src.fonts, '**/*.{otf,eot,svg,ttf,woff,woff2}'))
      .pipe(vfs.dest(config.paths.tmp.fonts))
      .on('end', () => {
        fancyLog(chalk.green('完成处理fonts目录中所有字体文件。'))
        cb()
      })
  }

  /**
   * 处理自定义文件
   **/
  function handleCustom(cb) {
    const customPath = path.join(process.cwd(), config.paths.src.custom)
    const exist = fs.existsSync(customPath)

    if (!exist) return cb()

    vfs.src(`${customPath}/**/*`)
      .pipe(vfs.dest(config.paths.tmp.custom))
      .on('end', () => {
        fancyLog(chalk.green('完成处理custom目录中所有自定义文件。'))
        cb()
      })
  }

  /**
   * 编译css
   **/
  function compileCss(cb) {
    if (glob.sync(`${config.paths.src.styles}/*.css`).length === 0 && glob.sync(`${config.paths.src.appJs}/**/index.css`).length === 0) return cb()

    vfs.src([`${config.paths.src.styles}/*.css`, `${config.paths.src.appJs}/**/index.css`])
      //css中的rem转换
      .pipe(gulpif(
        config.useREM.css.available,
        postcss([
          postcssPxtorem(Object.assign({}, config.useREM.css.options))
        ])
      ))
      .pipe(postcss(postcssOption))
      .pipe(gulpif(
        config.useCssMin.available,
        minifyCSS(config.useCssMin.options)
      ))
      .pipe(vfs.dest(config.paths.tmp.css))
      .on('end', () => {
        fancyLog(chalk.green(`完成编译CSS文件。`))
        cb()
      })
  }

  /**
   * 编译less
   **/
  function compileLess(cb) {
    if (glob.sync(`${config.paths.src.styles}/*.less`).length === 0 && glob.sync(`${config.paths.src.appJs}/**/index.less`).length === 0) return cb()

    vfs.src([`${config.paths.src.styles}/*.less`, `${config.paths.src.appJs}/**/index.less`])
      .pipe(less(Object.assign({
        relativeUrls: true //将网址编译成相对网址
      }, config.style.lessOptions)))
      //css中的rem转换
      .pipe(gulpif(
        config.useREM.css.available,
        postcss([
          postcssPxtorem(Object.assign({}, config.useREM.css.options))
        ])
      ))
      .pipe(postcss(postcssOption))
      .pipe(gulpif(
        config.useCssMin.available,
        minifyCSS(config.useCssMin.options)
      ))
      .pipe(vfs.dest(config.paths.tmp.css))
      .on('end', () => {
        fancyLog(chalk.green(`完成编译LESS文件。`))
        cb()
      })
  }

  /**
   * 编译sass
   **/
  function compileSass(cb) {
    if (glob.sync(`${config.paths.src.styles}/*.{scss,sass}`).length === 0 && glob.sync(`${config.paths.src.appJs}/**/index.{scss,sass}`).length === 0) return cb()

    vfs.src([`${config.paths.src.styles}/*.{scss,sass}`, `${config.paths.src.appJs}/**/index.{scss,sass}`])
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
      //css中的rem转换
      .pipe(gulpif(
        config.useREM.css.available,
        postcss([
          postcssPxtorem(Object.assign({}, config.useREM.css.options))
        ])
      ))
      .pipe(postcss(postcssOption))
      .pipe(gulpif(
        config.useCssMin.available,
        minifyCSS(config.useCssMin.options)
      ))
      .pipe(vfs.dest(config.paths.tmp.css))
      .on('end', () => {
        fancyLog(chalk.green(`完成编译SASS文件。`))
        cb()
      })
  }

  /**
   * 编译stylus
   **/
  function compileStylus(cb) {
    if (glob.sync(`${config.paths.src.styles}/*.styl`).length === 0 && glob.sync(`${config.paths.src.appJs}/**/index.styl`).length === 0) return cb()

    vfs.src([`${config.paths.src.styles}/*.styl`, `${config.paths.src.appJs}/**/index.styl`])
      .pipe(stylus(Object.assign({}, config.style.stylusOptions)))
      //css中的rem转换
      .pipe(gulpif(
        config.useREM.css.available,
        postcss([
          postcssPxtorem(Object.assign({}, config.useREM.css.options))
        ])
      ))
      .pipe(postcss(postcssOption))
      .pipe(gulpif(
        config.useCssMin.available,
        minifyCSS(config.useCssMin.options)
      ))
      .pipe(vfs.dest(config.paths.tmp.css))
      .on('end', () => {
        fancyLog(chalk.green(`完成编译Stylus文件。`))
        cb()
      })
  }

  /**
   * 编译业务层js
   **/
  function handleJs(cb) {
    fancyLog(chalk.yellow('编译打包Javascript...'))
    compileJs.dist()
      .then(() => {
        // spinner.stop()
        fancyLog(chalk.green('完成编译打包Javascript。'))
        cb()
      })
      .catch((error) => {
        console.log(error)
      })
  }

  /**
   * 复制bower文件到缓存目录等待处理
   **/
  function copyBowerFiles(cb) {
    if (!bowerAvailable()) return cb()

    const jsFilter = filter('**/*.js', {
      restore: true
    })
    const cssFilter = filter('**/*.css', {
      restore: true
    })
    const fontFilter = filter('**/*.{eot,svg,ttf,woff,woff2}')

    vfs.src(mainBowerFiles())
      .pipe(jsFilter)
      .pipe(vfs.dest(`./tmp/bower/js`))
      .pipe(jsFilter.restore)
      .pipe(cssFilter)
      //Bower 中的 css rem 转换
      .pipe(gulpif(
        config.useREM.css.available,
        postcss([
          postcssPxtorem({})
        ])
      ))
      .pipe(vfs.dest(`./tmp/bower/css`))
      .pipe(cssFilter.restore)
      .pipe(fontFilter)
      .pipe(flatten())
      .pipe(vfs.dest(config.paths.tmp.fonts))
      .on('end', () => {
        fancyLog(chalk.green('完成处理Bower第三方框架库文件到缓存目录。'))
        cb()
      })
  }

  function bowerCustomJs(cb) {
    if (!bowerAvailable() || config.useInject.vendor.js.length === 0) return cb()

    let fileIndex = 0

    for (let elem of config.useInject.vendor.js) {
      vfs.src('./tmp/bower/**/*.js')
        .pipe(filter(elem.contain))
        .pipe(concatOrder(elem.contain))
        .pipe(concatJs(`vendor-${elem.target}`))
        .pipe(gulpif(
          config.useJsMin,
          uglify()
        ))
        .pipe(vfs.dest(config.paths.tmp.appjs))
        .on("end", () => {
          fileIndex++

          let delFiles = []

          for (let item of elem.contain) {
            delFiles.push(`./tmp/bower/${item}`)
          }

          del.sync(delFiles)

          if (fileIndex >= config.useInject.vendor.js.length) {
            fancyLog(chalk.green('完成合并自定义配置的第三方框架库JS文件。'))
            cb()
          }
        })
    }
  }

  function bowerVendorJs(cb) {
    if (!bowerAvailable()) return cb()

    vfs.src('./tmp/bower/**/*.js')
      .pipe(filter('**/*.js'))
      .pipe(concatJs('vendor.js'))
      .pipe(gulpif(
        config.useJsMin,
        uglify()
      ))
      .pipe(vfs.dest(config.paths.tmp.appjs))
      .on('end', () => {
        fancyLog(chalk.green('完成合并默认的第三方框架库JS文件。'))
        cb()
      })
  }

  function bowerCustomCss(cb) {
    if (!bowerAvailable() || config.useInject.vendor.css.length === 0) return cb()

    let fileIndex = 0

    for (let elem of config.useInject.vendor.css) {
      vfs.src(`./tmp/bower/**/*.css`)
        .pipe(filter(elem.contain))
        .pipe(concatOrder(elem.contain))
        .pipe(concatCss(`vendor-${elem.target}`, { rebaseUrls: false }))
        .pipe(gulpif(
          config.useCssMin.available,
          minifyCSS()
        ))
        .pipe(flatten())
        .pipe(vfs.dest(config.paths.tmp.css))
        .on("end", () => {
          fileIndex++
          let delFiles = []

          for (let item of elem.contain) {
            delFiles.push(`./tmp/bower/${item}`)
          }

          del.sync(delFiles)

          if (fileIndex >= config.useInject.vendor.css.length) {
            fancyLog(chalk.green('完成合并自定义配置的第三方框架库样式文件。'))
            cb()
          }
        })
    }
  }

  function bowerVendorCss(cb) {
    if (!bowerAvailable()) return cb()

    vfs.src('./tmp/bower/**/*.css')
      .pipe(filter('**/*.css'))
      .pipe(concatCss('vendor.css', { rebaseUrls: false }))
      .pipe(gulpif(
        config.useCssMin.available,
        minifyCSS()
      ))
      .pipe(flatten())
      .pipe(vfs.dest(config.paths.tmp.css))
      .on("end", () => {
        del.sync(['./tmp/bower'])
        fancyLog(chalk.green('完成合并默认的第三方框架库样式文件。'))
        cb()
      })
  }

  /**
   * 复制公共脚本到缓存目录等待处理
   **/
  function copyLibFiles(cb) {
    if (!fs.existsSync(path.join(process.cwd(), config.paths.src.common))) return cb()

    vfs.src(path.join(process.cwd(), config.paths.src.common, '**/*.js'))
      .pipe(vfs.dest(`./tmp/common/js`))
      .on('end', () => {
        fancyLog(chalk.green('完成处理common目录中公共JS文件到缓存目录。'))
        cb()
      })
  }

  /**
   * 根据 fez.config.js 配置项合并公共脚本
   **/
  function commonCustomJs(cb) {
    if (!fs.existsSync(path.join(process.cwd(), config.paths.src.common)) || !config.useInject.common.available || config.useInject.common.js.length === 0) return cb()

    let fileIndex = 0

    for (let elem of config.useInject.common.js) {
      vfs.src('./tmp/common/**/*.js')
        .pipe(filter(elem.contain))
        .pipe(concatOrder(elem.contain))
        .pipe(concatJs(`common-${elem.target}`))
        .pipe(gulpif(
          config.useJsMin,
          uglify()
        ))
        .pipe(vfs.dest(config.paths.tmp.appjs))
        .on("end", () => {
          fileIndex++

          let delFiles = []

          for (let item of elem.contain) {
            delFiles.push(`./tmp/common/${item}`)
          }

          del.sync(delFiles)

          if (fileIndex >= config.useInject.common.js.length) {
            fancyLog(chalk.green('完成合并自定义配置的common目录中公共JS文件。'))
            cb()
          }
        })
    }
  }

  /**
   * 处理插入到指定页面的脚本
   **/
  function commonAssignJs(cb) {
    if (!fs.existsSync(path.join(process.cwd(), config.paths.src.common))) return cb()

    vfs.src('./tmp/common/**/assign*.js')
      .pipe(flatten())
      .pipe(gulpif(
        config.useJsMin,
        uglify()
      ))
      .pipe(vfs.dest(config.paths.tmp.appjs))
      .on("end", () => {
        del.sync(`./tmp/common/**/assign*.js`)
        fancyLog(chalk.green('完成插入指定的common目录中的文件到html模板页面。'))
        cb()
      })
  }

  /**
   * 合并 fez.config.js 中未配置的剩下的所有公共脚本
   **/
  function commonJs(cb) {
    if (!fs.existsSync(path.join(process.cwd(), config.paths.src
        .common))) return cb()

    vfs.src('./tmp/common/**/*.js')
      .pipe(filter('**/*.js'))
      .pipe(concatJs('common.js'))
      .pipe(gulpif(
        config.useJsMin,
        uglify()
      ))
      .pipe(vfs.dest(config.paths.tmp.appjs))
      .on("end", () => {
        del.sync(['./tmp/common'])
        fancyLog(chalk.green('完成合并默认的common目录中公共JS文件。'))
        cb()
      })
  }

  /**
   * html 编译
   **/
  function compileHtml(cb) {
    //压缩编译html
    const htmlMinPipe = lazypipe()
      .pipe(() => {
        return usemin({
          css: [minifyCSS()],
          html: [() => {
            const options = {}
            Object.assign(options, config.useHtmlMin.options, {
              removeComments: true, //清除HTML注释
              collapseWhitespace: true, //压缩HTML
              collapseBooleanAttributes: true, //省略布尔属性的值 <input checked="true"/> ==> <input checked />
              removeEmptyAttributes: true, //删除所有空格作属性值 <input id="" /> ==> <input />
              removeScriptTypeAttributes: true, //删除<script>的type="text/javascript"
              removeStyleLinkTypeAttributes: true, //删除<style>和<link>的type="text/css"
              minifyJS: true, //压缩页面JS
              minifyCSS: true //压缩页面CSS
            })
            return htmlmin(options)
          }],
          js: [uglify()],
          assetsDir: './src/'
        })
      })

    //合并后的bower文件注入
    const injectVendorFiles = lazypipe()
      .pipe(() => {
        return inject(vfs.src([`./tmp/static/js/**/manifest*.js`, `./tmp/static/js/**/vendor*.js`, `./tmp/static/css/**/vendor*.css`, `./tmp/static/js/**/vendor*.css`], {
          read: false
        }), {
          starttag: '<!-- inject:vendor:{{ext}} -->',
          ignorePath: '../../../tmp/',
          relative: true,
          quiet: true
        })
      })

    //公共文件注入
    const injectLibFiles = lazypipe()
      .pipe(() => {
        return inject(vfs.src([`./tmp/static/css/**/${config.useInject.common.css}*.css`, `./tmp/static/js/**/common*.js`, `./tmp/static/js/**/common*.css`, `!./tmp/static/js/**/assign-*.js`], {
          read: false
        }), {
          starttag: '<!-- inject:common:{{ext}} -->',
          ignorePath: '../../../tmp/',
          relative: true,
          quiet: true
        })
      })

    //处理页面
    const injectHtml = (es) => {
      return es.map((file, cb) => {
        let cateName = file.path.match(/((.*?)[\/|\\])*([^.]+).*/)[2]

        vfs.src(file.path)
          .pipe(rename(cateName + '.html'))
          .pipe(gulpif(
            config.useInject.vendor.available,
            injectVendorFiles()
          ))
          .pipe(gulpif(
            config.useInject.common.available,
            injectLibFiles()
          ))
          .pipe(gulpif(
            config.useInject.page,
            inject(vfs.src([`./tmp/static/js/**/assign*-${cateName}*.js`, `./tmp/**/css/${cateName}.css`, `./tmp/**/css/${cateName}/index.css`, `./tmp/static/js/**/${cateName}.js`, `./tmp/**/js/${cateName}.css`], {
              read: false
            }), {
              starttag: '<!-- inject:page:{{ext}} -->',
              ignorePath: '../../../tmp/',
              relative: true,
              quiet: true
            })
          ))
          .pipe(gulpif(
            config.useHtmlMin.available,
            htmlMinPipe()
          ))
          .pipe(vfs.dest(config.paths.tmp.html))
          .on("end", () => {
            cb()
          })
      })
    }

    /**
     * 入口页面
     */
    const indexHtmlFilter = filter('**/index.html', {
      restore: true
    })

    vfs.src(path.join(process.cwd(), config.paths.src.html, '**/*.html'))
      .pipe(indexHtmlFilter)
      .pipe(injectHtml(es))
      .pipe(indexHtmlFilter.restore)
      .pipe(vfs.dest(config.paths.tmp.html))
      .on("end", () => {
        fancyLog(chalk.green('完成编译HTML并处理编译后的JS、CSS文件自动引用到HTML模板页面。'))
        cb()
      })
  }

  /**
   * CDN 地址替换
   **/
  function cdnReplace(cb) {
    if (!config.useCdn.available) return cb()

    vfs.src([`${config.paths.tmp.dir}/**/*.{${config.useCdn.extFile}}`])
      .pipe(cdnify({
        base: config.useCdn.base,
        rewriter: (url, process) => {
          if (/http|https|^(\/\/)/.test(url)) {
            return process(url)
          } else if (/eot|ttf|woff|woff2|svg/.test(url)) {
            url = url.replace(/(\.\.\/fonts)|(\/static\/fonts)/, 'static/fonts')
            return `${config.useCdn.fonts||config.useCdn.base}${url}`
          } else if (/(png|jpg|gif)$/.test(url)) {
            url = url.replace(/(\.\.\/images)|(\/static\/images)/, 'static/images')
            return `${config.useCdn.images||config.useCdn.base}${url}`
          } else if (/(js)$/.test(url)) {
            return `${config.useCdn.js||config.useCdn.base}${url}`
          } else if (/(css)$/.test(url)) {
            return `${config.useCdn.css||config.useCdn.base}${url}`
          } else {
            return process(url)
          }
        }
      }))
      .pipe(vfs.dest(config.paths.tmp.dir))
      .on('end', () => {
        fancyLog(chalk.green('完成添加所有静态资源CDN地址。'))
        cb()
      })
  }

  /**
   * webp 编译
   **/
  function compileWebp(cb) {
    if (!config.useWebp.available) return cb()

    webp()
      .then(() => {
        fancyLog(chalk.green('完成WebP编译。'))
        cb()
      })
  }

  /**
   * 生成Md5版本号
   **/
  function reversion(cb) {
    if (!config.useMd5.available) return cb()

    vfs.src([`${config.paths.tmp.dir}/**/*`, `!${config.paths.tmp.dir}/**/*.html`, `!${config.paths.tmp.dir}/**/images/**/*`, `!${config.paths.tmp.dir}/**/fonts/**/*`])
      .pipe(RevAll())
      .pipe(revDel())
      .pipe(vfs.dest(config.paths.tmp.dir))
      .pipe(RevAll.manifest({
        merge: true
      }))
      .pipe(vfs.dest(config.paths.tmp.dir))
      .on('end', () => {
        fancyLog(chalk.green('完成添加JS、CSS资源MD5版本号。'))
        cb()
      })
  }

  /**
   * 为图片生成Md5版本号
   **/
  function reversionImages(cb) {
    vfs.src(path.join(process.cwd(), config.paths.tmp.img, '**/*'))
      .pipe(RevAll())
      .pipe(revDel())
      .pipe(vfs.dest(config.paths.tmp.img))
      .pipe(RevAll.manifest({
        merge: true
      }))
      .pipe(vfs.dest(config.paths.tmp.img))
      .on('end', () => {
        fancyLog(chalk.green('完成添加图片资源MD5版本号。'))
        cb()
      })
  }

  /**
   * 为字体生成Md5版本号
   **/
  function reversionFonts(cb) {
    if (!config.useMd5.available) return cb()

    vfs.src(path.join(process.cwd(), config.paths.tmp.fonts, '**/*.{otf,eot,svg,ttf,woff,woff2}'))
      .pipe(RevAll())
      .pipe(revDel())
      .pipe(vfs.dest(config.paths.tmp.fonts))
      .pipe(RevAll.manifest({
        merge: true
      }))
      .pipe(vfs.dest(config.paths.tmp.fonts))
      .on('end', () => {
        fancyLog(chalk.green('完成添加字体资源MD5版本号。'))
        cb()
      })
  }

  /**
   * 替换md5后缀的文件名
   */
  function reversionRepalce(cb) {
    if (!config.useMd5.available) return cb()

    let manifest = vfs.src(`${config.paths.tmp.dir}/**/rev-manifest*.json`)
    vfs.src([`${config.paths.tmp.dir}/**/*`])
      .pipe(RevReplace({
        manifest: manifest
      }))
      .pipe(vfs.dest(config.paths.tmp.dir))
      .on('end', () => {
        fancyLog(chalk.green('生成所有静态资源MD5版本号。'))
        cb()
      })
  }

  /**
   * 完成编译
   */
  function compileChanged(cb) {
    //清除 tmp 目录
    const delTmp = () => del([config.paths.tmp.dir])

    vfs.src(`${config.paths.tmp.dir}/**/*`, {
        base: config.paths.tmp.dir
      })
      .pipe(vfs.dest(config.paths.dist.dir))
      .on('end', () => {
        delTmp()
        fancyLog(chalk.magenta(`发布代码到${config.paths.dist.dir}目录。`))
        cb()
      })
  }


  /**
   * 生产任务
   * series 中的任务同步执行
   * parallel 中的任务异步执行
   */
  async.series([
    function(next) {
      delDist(next)
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
          handleImages(cb)
        },
        function(cb) {
          handleFonts(cb)
        },
        function(cb) {
          handleCustom(cb)
        },
        function(cb) {
          svgSymbol(cb)
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
          handleJs(cb)
        },
        function(cb) {
          async.series([
            function(next) {
              copyBowerFiles(next)
            },
            function(next) {
              async.parallel([
                function(cb) {
                  async.series([
                    function(next) {
                      bowerCustomJs(next)
                    },
                    function(next) {
                      bowerVendorJs(next)
                    }
                  ], function(error) {
                    if (error) {
                      throw new Error(error)
                    }
                    cb()
                  })
                },
                function(cb) {
                  bowerCustomCss(cb)
                }
              ], function(error) {
                if (error) {
                  throw new Error(error)
                }
                next()
              })
            },
            function(next) {
              bowerVendorCss(next)
            }
          ], function(error) {
            if (error) {
              throw new Error(error)
            }
            cb()
          })
        },
        function(cb) {
          async.series([
            function(next) {
              copyLibFiles(next)
            },
            function(next) {
              commonCustomJs(next)
            },
            function(next) {
              commonAssignJs(next)
            },
            function(next) {
              commonJs(next)
            }
          ], function(error) {
            if (error) {
              throw new Error(error)
            }
            cb()
          })
        }
      ], function(error) {
        if (error) {
          throw new Error(error)
        }
        next()
      })
    },
    function(next) {
      compileHtml(next)
    },
    function(next) {
      async.parallel([
        function(cb) {
          reversion(cb)
        },
        function(cb) {
          reversionImages(cb)
        },
        function(cb) {
          reversionFonts(cb)
        }
      ], function(error) {
        if (error) {
          throw new Error(error)
        }
        next()
      })
    },
    function(next) {
      reversionRepalce(next)
    },
    function(next) {
      compileWebp(next)
    },
    function(next) {
      cdnReplace(next)
    },
    function(next) {
      compileChanged(next)
    }
  ], function(err) {
    if (err) {
      throw new Error(err)
    }
    fancyLog(chalk.cyan('Release succeed.'))
    console.timeEnd('dist')
  })
}
