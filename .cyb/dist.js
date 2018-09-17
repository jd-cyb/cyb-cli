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
const revFormat = require('gulp-rev-format');
const revDel = require('gulp-rev-delete-original')
const concatJs = require('gulp-concat')
const concatCss = require('gulp-concat-css')
const concatOrder = require("gulp-fez-order")
const cdnify = require('gulp-fez-cdn')
const vfs = require('vinyl-fs')
const async = require('async')
const glob = require('glob')
const ora = require('ora')
const distReport = require('./lib/report')
const config = require('./lib/fezconfig')
const webp = require('./lib/webp')
const compileJs = require('./lib/webpack')

module.exports = () => {
  let startTime = new Date
  const spinner = ora(chalk.cyan('Starting dist for production...')).start()
  /**
   * postcss配置
   */
  const postcssOption = [autoprefixer(config.autoprefixer.options)]


  /**
   * 检测bower是否可用
   */
  const bowerAvailable = () => {

    if (!config.merge.vendor.available) return false
    if (!fs.existsSync(path.join(process.cwd(), 'bower_components'))) return false
    if (mainBowerFiles().length <= 0) return false

    return true
  }

  /**
   * 清除 dist 目录
   **/
  function delDist(cb) {
    del(config.paths.dist.dir)
      .then(() => {
        cb()
      })
  }

  /**
   * 处理图片
   **/
  function handleImages(cb) {
    const imagesPath = path.join(process.cwd(), config.paths.src.img)
    const exist = fs.existsSync(imagesPath)

    if (!exist) return cb()

    vfs.src(`${imagesPath}/**/*`)
      .pipe(vfs.dest(config.paths.tmp.img))
      .pipe(RevAll())
      .pipe(revFormat({
        prefix: '.'
      }))
      .pipe(revDel())
      .pipe(vfs.dest(config.paths.tmp.img))
      .pipe(RevAll.manifest(path.join(config.paths.tmp.img, 'rev-manifest.json'), {
        base: config.paths.tmp.img,
        merge: true
      }))
      .pipe(vfs.dest(config.paths.tmp.img))
      .on('end', () => {
        cb()
      })
  }

  /**
   * 处理字体
   **/
  function handleFonts(cb) {
    const fontPath = path.join(process.cwd(), config.paths.src.fonts)
    const exist = fs.existsSync(fontPath)

    if (!exist) return cb()

    vfs.src(`${fontPath}/**/*.{otf,eot,svg,ttf,woff,woff2}`)
      .pipe(vfs.dest(config.paths.tmp.fonts))
      .pipe(RevAll())
      .pipe(revFormat({
        prefix: '.'
      }))
      .pipe(revDel())
      .pipe(vfs.dest(config.paths.tmp.fonts))
      .pipe(RevAll.manifest(path.join(config.paths.tmp.fonts, 'rev-manifest.json'), {
        base: config.paths.tmp.fonts,
        merge: true
      }))
      .pipe(vfs.dest(config.paths.tmp.fonts))
      .on('end', () => {
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
    /**
     * 自定义custom目录不做revision
     */
    vfs.src(`${customPath}/**/*`)
      .pipe(vfs.dest(config.paths.tmp.custom))
      .on('end', () => {
        cb()
      })
  }

  /**
   * 编译css
   **/
  function compileCss(cb) {
    if (glob.sync(`${config.paths.src.styles}/*.css`).length === 0) return cb()

    let manifest = vfs.src(`${config.paths.tmp.dir}/**/rev-manifest.json`)

    vfs.src(`${config.paths.src.styles}/*.css`)
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
      .pipe(RevReplace({
        manifest: manifest
      }))
      .pipe(cdnify({
        base: '',
        rewriter: (url, process) => {
          if (/(^(\/)?static)\/(.*?)\.(png|jpe?g|gif|svg|mp4|webm|ogg|mp3|wav|flac|aac|woff2?|eot|ttf|otf)/.test(url)) {
            url = url.replace(/((\/)?static\/)/, '../')
            return url
          } else {
            return process(url)
          }
        }
      }))
      .pipe(vfs.dest(config.paths.tmp.css))
      .pipe(RevAll())
      .pipe(revFormat({
        prefix: '.'
      }))
      .pipe(revDel())
      .pipe(vfs.dest(config.paths.tmp.css))
      .pipe(RevAll.manifest(path.join(config.paths.tmp.css, 'rev-manifest.json'), {
        base: config.paths.tmp.css,
        merge: true
      }))
      .pipe(vfs.dest(config.paths.tmp.css))
      .on('end', () => {
        cb()
      })
  }

  /**
   * 编译less
   **/
  function compileLess(cb) {
    if (glob.sync(`${config.paths.src.styles}/*.less`).length === 0) return cb()

    let manifest = vfs.src(`${config.paths.tmp.dir}/**/rev-manifest.json`)

    vfs.src(`${config.paths.src.styles}/*.less`)
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
      .pipe(RevReplace({
        manifest: manifest
      }))
      .pipe(cdnify({
        base: '',
        rewriter: (url, process) => {
          if (/(^(\/)?static)\/(.*?)\.(png|jpe?g|gif|svg|mp4|webm|ogg|mp3|wav|flac|aac|woff2?|eot|ttf|otf)/.test(url)) {
            url = url.replace(/((\/)?static\/)/, '../')
            return url
          } else {
            return process(url)
          }
        }
      }))
      .pipe(vfs.dest(config.paths.tmp.css))
      .pipe(RevAll())
      .pipe(revFormat({
        prefix: '.'
      }))
      .pipe(revDel())
      .pipe(vfs.dest(config.paths.tmp.css))
      .pipe(RevAll.manifest(path.join(config.paths.tmp.css, 'rev-manifest.json'), {
        base: config.paths.tmp.css,
        merge: true
      }))
      .pipe(vfs.dest(config.paths.tmp.css))
      .on('end', () => {
        cb()
      })
  }

  /**
   * 编译sass
   **/
  function compileSass(cb) {
    if (glob.sync(`${config.paths.src.styles}/*.{scss,sass}`).length === 0) return cb()

    let manifest = vfs.src(`${config.paths.tmp.dir}/**/rev-manifest.json`)

    vfs.src(`${config.paths.src.styles}/*.{scss,sass}`)
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
      .pipe(RevReplace({
        manifest: manifest
      }))
      .pipe(cdnify({
        base: '',
        rewriter: (url, process) => {
          if (/(^(\/)?static)\/(.*?)\.(png|jpe?g|gif|svg|mp4|webm|ogg|mp3|wav|flac|aac|woff2?|eot|ttf|otf)/.test(url)) {
            url = url.replace(/((\/)?static\/)/, '../')
            return url
          } else {
            return process(url)
          }
        }
      }))
      .pipe(vfs.dest(config.paths.tmp.css))
      .pipe(RevAll())
      .pipe(revFormat({
        prefix: '.'
      }))
      .pipe(revDel())
      .pipe(vfs.dest(config.paths.tmp.css))
      .pipe(RevAll.manifest(path.join(config.paths.tmp.css, 'rev-manifest.json'), {
        base: config.paths.tmp.css,
        merge: true
      }))
      .pipe(vfs.dest(config.paths.tmp.css))
      .on('end', () => {
        cb()
      })
  }

  /**
   * 编译stylus
   **/
  function compileStylus(cb) {
    if (glob.sync(`${config.paths.src.styles}/*.styl`).length === 0) return cb()

    let manifest = vfs.src(`${config.paths.tmp.dir}/**/rev-manifest.json`)

    vfs.src(`${config.paths.src.styles}/*.styl`)
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
      .pipe(RevReplace({
        manifest: manifest
      }))
      .pipe(cdnify({
        base: '',
        rewriter: (url, process) => {
          if (/(^(\/)?static)\/(.*?)\.(png|jpe?g|gif|svg|mp4|webm|ogg|mp3|wav|flac|aac|woff2?|eot|ttf|otf)/.test(url)) {
            url = url.replace(/((\/)?static\/)/, '../')
            return url
          } else {
            return process(url)
          }
        }
      }))
      .pipe(vfs.dest(config.paths.tmp.css))
      .pipe(RevAll())
      .pipe(revFormat({
        prefix: '.'
      }))
      .pipe(revDel())
      .pipe(vfs.dest(config.paths.tmp.css))
      .pipe(RevAll.manifest(path.join(config.paths.tmp.css, 'rev-manifest.json'), {
        base: config.paths.tmp.css,
        merge: true
      }))
      .pipe(vfs.dest(config.paths.tmp.css))
      .on('end', () => {
        cb()
      })
  }

  /**
   * 编译业务层js
   **/
  function handleJs(cb) {
    spinner.stop()
    console.log(chalk.yellow('Building javascript with webpack...'))
    compileJs.dist()
      .then(() => {
        // spinner.stop()
        let manifest = vfs.src(`${config.paths.tmp.dir}/**/rev-manifest.json`)
        vfs.src(`${config.paths.tmp.appjs}/**/*`)
          .pipe(RevReplace({
            manifest: manifest
          }))
          .pipe(vfs.dest(config.paths.tmp.appjs))
          .on('end', () => {
            spinner.start(chalk.cyan('Starting dist for production...'))
            cb()
          })
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
      .pipe(RevAll())
      .pipe(revFormat({
        prefix: '.'
      }))
      .pipe(revDel())
      .pipe(vfs.dest(config.paths.tmp.fonts))
      .pipe(RevAll.manifest(path.join(config.paths.tmp.fonts, 'rev-manifest.json'), {
        base: config.paths.tmp.fonts,
        merge: true
      }))
      .pipe(vfs.dest(config.paths.tmp.fonts))
      .on('end', () => {
        cb()
      })
  }

  function bowerCustomJs(cb) {
    if (!bowerAvailable() || config.merge.vendor.js.length === 0) return cb()

    let fileIndex = 0
    for (let [index, elem] of config.merge.vendor.js.entries()) {
      vfs.src('./tmp/bower/**/*.js')
        .pipe(filter(elem.contain))
        .pipe(concatOrder(elem.contain))
        .pipe(concatJs(`vendor-${index}-bower-${elem.target}`))
        .pipe(uglify())
        .pipe(vfs.dest(config.paths.tmp.appjs))
        .on("end", () => {
          fileIndex++
          let delFiles = []

          for (let item of elem.contain) {
            delFiles.push(`./tmp/bower/${item}`)
          }

          del.sync(delFiles)

          if (fileIndex >= config.merge.vendor.js.length) {
            cb()
          }
        })
    }
  }

  function bowerVendorJs(cb) {
    if (!bowerAvailable()) return cb()

    vfs.src('./tmp/bower/**/*.js')
      .pipe(filter('**/*.js'))
      .pipe(concatJs('vendor-bower.js'))
      .pipe(uglify())
      .pipe(vfs.dest(config.paths.tmp.appjs))
      .on('end', () => {
        cb()
      })
  }

  function bowerCustomCss(cb) {
    if (!bowerAvailable() || config.merge.vendor.css.length === 0) return cb()

    let fileIndex = 0

    for (let [index, elem] of config.merge.vendor.css.entries()) {
      vfs.src(`./tmp/bower/**/*.css`)
        .pipe(filter(elem.contain))
        .pipe(concatOrder(elem.contain))
        .pipe(concatCss(`vendor-${index}-bower-${elem.target}`, { rebaseUrls: false }))
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

          if (fileIndex >= config.merge.vendor.css.length) {
            cb()
          }
        })
    }
  }

  function bowerVendorCss(cb) {
    if (!bowerAvailable()) return cb()

    vfs.src('./tmp/bower/**/*.css')
      .pipe(filter('**/*.css'))
      .pipe(concatCss('vendor-bower.css', { rebaseUrls: false }))
      .pipe(gulpif(
        config.useCssMin.available,
        minifyCSS()
      ))
      .pipe(flatten())
      .pipe(vfs.dest(config.paths.tmp.css))
      .on("end", () => {
        del.sync(['./tmp/bower'])
        cb()
      })
  }

  /**
   * 复制公共脚本到缓存目录等待处理
   **/
  function copyCommonFiles(cb) {
    if (!fs.existsSync(path.join(process.cwd(), config.paths.src.common))) return cb()

    vfs.src(`${config.paths.src.common}/**/*.js`)
      .pipe(vfs.dest(config.paths.tmp.common))
      .on('end', () => {
        cb()
      })
  }

  /**
   * 根据 fez.config.js 配置项合并公共脚本
   **/
  function commonCustomJs(cb) {
    if (!fs.existsSync(path.join(process.cwd(), config.paths.src.common)) || !config.merge.common.available || config.merge.common.js.length === 0) return cb()

    let fileIndex = 0

    for (let [index, elem] of config.merge.common.js.entries()) {
      vfs.src(`${config.paths.tmp.common}/**/*.js`)
        .pipe(filter(elem.contain))
        .pipe(concatOrder(elem.contain))
        .pipe(concatJs(`common-${index}-browser-${elem.target}`))
        .pipe(uglify())
        .pipe(vfs.dest(config.paths.tmp.appjs))
        .on("end", () => {
          fileIndex++

          let delFiles = []

          for (let item of elem.contain) {
            delFiles.push(path.join(config.paths.tmp.common, `${item}*`))
          }

          del.sync(delFiles)

          if (fileIndex >= config.merge.common.js.length) {
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

    vfs.src(`${config.paths.tmp.common}/**/assign*.js`)
      .pipe(flatten())
      .pipe(uglify())
      .pipe(vfs.dest(config.paths.tmp.appjs))
      .on("end", () => {
        del.sync(path.join(config.paths.tmp.common, `**/assign*.js`))
        cb()
      })
  }

  /**
   * 合并 fez.config.js 中未配置的剩下的所有公共脚本
   **/
  function commonJs(cb) {
    if (!fs.existsSync(path.join(process.cwd(), config.paths.src.common))) return cb()

    vfs.src(`${config.paths.tmp.common}**/*.js`)
      .pipe(filter('**/*.js'))
      .pipe(concatJs('common-browser.js'))
      .pipe(uglify())
      .pipe(vfs.dest(config.paths.tmp.appjs))
      .on("end", () => {
        del.sync([config.paths.tmp.common])
        cb()
      })
  }

  /**
   * 为bower和common统一添加版本号
   **/
  function reversionBowerCommonJs(cb) {
    let manifest = vfs.src(`${config.paths.tmp.dir}/**/rev-manifest.json`)
    vfs.src(`${config.paths.tmp.appjs}/**/*.js`)
      .pipe(RevReplace({
        manifest: manifest
      }))
      .pipe(RevAll())
      .pipe(revFormat({
        prefix: '.'
      }))
      .pipe(revDel())
      .pipe(vfs.dest(config.paths.tmp.appjs))
      .pipe(RevAll.manifest(path.join(config.paths.tmp.appjs, 'rev-manifest.json'), {
        base: config.paths.tmp.appjs,
        merge: true
      }))
      .pipe(vfs.dest(config.paths.tmp.appjs))
      .on('end', () => {
        cb()
      })
  }

  /**
   * 为bower和common统一添加版本号
   **/
  function reversionBowerCommonCss(cb) {
    let manifest = vfs.src(`${config.paths.tmp.dir}/**/rev-manifest.json`)
    vfs.src(`${config.paths.tmp.css}/**/*.css`)
      .pipe(RevReplace({
        manifest: manifest
      }))
      .pipe(cdnify({
        base: '',
        rewriter: (url, process) => {
          if (/(^(\/)?static)\/(.*?)\.(png|jpe?g|gif|svg|mp4|webm|ogg|mp3|wav|flac|aac|woff2?|eot|ttf|otf)/.test(url)) {
            url = url.replace(/((\/)?static\/)/, '../')
            return url
          } else {
            return process(url)
          }
        }
      }))
      .pipe(RevAll())
      .pipe(revFormat({
        prefix: '.'
      }))
      .pipe(revDel())
      .pipe(vfs.dest(config.paths.tmp.css))
      .pipe(RevAll.manifest(path.join(config.paths.tmp.css, 'rev-manifest.json'), {
        base: config.paths.tmp.css,
        merge: true
      }))
      .pipe(vfs.dest(config.paths.tmp.css))
      .on('end', () => {
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
        return inject(vfs.src([`./tmp/static/js/**/vendor*.js`, `./tmp/static/css/**/vendor*.css`, `./tmp/static/js/**/vendor*.css`], {
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
        return inject(vfs.src([`./tmp/static/css/**/common*.css`, `./tmp/static/js/**/common*.js`, `./tmp/static/js/**/common*.css`, `!./tmp/static/js/**/assign-*.js`], {
          read: false
        }), {
          starttag: '<!-- inject:common:{{ext}} -->',
          ignorePath: '../../../tmp/',
          relative: true,
          quiet: true
        })
      })

    /**
     * 将webpack生成的manifest自动注入到html中
     */
    const injectManifest = lazypipe()
      .pipe(() => {
        const manifestFile = glob.sync(path.join(config.paths.tmp.appjs, 'manifest*.js'))[0]
        const manifestScriptString = `<script>${fs.readFileSync(manifestFile).toString('utf-8')}</script>`
        return injectString.before('<!-- inject:vendor:js -->', manifestScriptString)
      });

    //处理页面
    const injectHtml = (es) => {
      return es.map((file, cb) => {
        let cateName = file.path.match(/((.*?)[\/|\\])*([^.]+).*/)[2]

        vfs.src(file.path)
          .pipe(rename(cateName + '.html'))
          .pipe(gulpif(
            config.merge.vendor.available,
            injectVendorFiles()
          ))
          .pipe(gulpif(
            config.merge.common.available,
            injectLibFiles()
          ))
          .pipe(gulpif(
            config.merge.page,
            inject(vfs.src([`./tmp/static/js/**/assign*-${cateName}*.js`, `./tmp/**/css/${cateName}.css`, `./tmp/**/css/${cateName}.*.css`, `./tmp/**/css/${cateName}/index.css`, `./tmp/static/js/**/${cateName}.js`, `./tmp/static/js/**/${cateName}.*.js`, `./tmp/**/js/${cateName}.css`], {
              read: false
            }), {
              starttag: '<!-- inject:page:{{ext}} -->',
              ignorePath: '../../../tmp/',
              relative: true,
              quiet: true
            })
          ))
          .pipe(injectManifest())
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
    vfs.src(`${config.paths.src.html}/**/*.html`)
      .pipe(indexHtmlFilter)
      .pipe(injectHtml(es))
      .pipe(indexHtmlFilter.restore)
      .pipe(vfs.dest(config.paths.tmp.html))
      .on("end", () => {
        let manifest = vfs.src(`${config.paths.tmp.dir}/**/rev-manifest.json`)
        vfs.src([`${config.paths.tmp.dir}/**/*`])
          .pipe(RevReplace({
            manifest: manifest
          }))
          .pipe(vfs.dest(config.paths.tmp.dir))
          .on('end', () => {
            del.sync(`${config.paths.tmp.dir}/**/rev-manifest.json`)
            cb()
          })
      })
  }

  /**
   * CDN 地址替换
   **/
  function cdnReplace(cb) {
    if (!config.useCdn.available) return cb()

    vfs.src(`${config.paths.tmp.dir}/**/*.{${config.useCdn.extFile}}`)
      .pipe(cdnify({
        base: config.useCdn.base,
        rewriter: (url, process) => {
          if (/http|https|^(\/\/)/.test(url)) {
            return process(url)
          } else if (/\.(eot|ttf|woff|woff2)/.test(url)) {
            url = url.replace(/(\.\.\/fonts)|(\/static\/fonts)/, 'static/fonts')
            return `${config.useCdn.fonts||config.useCdn.base}${url}`
          } else if (/\.(png|jpg|gif|svg)/.test(url)) {
            url = url.replace(/(\.\.\/images)|(\/static\/images)/, 'static/images')
            return `${config.useCdn.images||config.useCdn.base}${url}`
          } else if (/\.(js)$/.test(url)) {
            return `${config.useCdn.js||config.useCdn.base}${url}`
          } else if (/\.(css)$/.test(url)) {
            return `${config.useCdn.css||config.useCdn.base}${url}`
          } else {
            return process(url)
          }
        }
      }))
      .pipe(vfs.dest(config.paths.tmp.dir))
      .on('end', () => {
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
        cb()
      })
  }

  /**
   * 完成编译
   */
  function distComplete(cb) {

    //清除 tmp 目录
    const delTmp = () => del([config.paths.tmp.dir])

    vfs.src(`${config.paths.tmp.dir}/**/*`, {
        base: config.paths.tmp.dir,
      })
      .pipe(vfs.dest(config.paths.dist.dir))
      .on('end', () => {
        spinner.stop()
        delTmp()
        console.log(distReport(config.paths.dist.dir))
        console.log(chalk.magenta(`The ${config.paths.dist.dir} directory is ready to be deployed.`))
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
              copyCommonFiles(next)
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
      async.parallel([
        function(cb) {
          reversionBowerCommonJs(cb)
        },
        function(cb) {
          reversionBowerCommonCss(cb)
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
          handleImages(cb)
        },
        function(cb) {
          handleFonts(cb)
        },
        function(cb) {
          handleCustom(cb)
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
          handleJs(cb)
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
      compileWebp(next)
    },
    function(next) {
      cdnReplace(next)
    },
    function(next) {
      distComplete(next)
    }
  ], function(err) {
    if (err) {
      throw new Error(err)
    }
    const buildTime = (new Date() - startTime) / 1000 + 's';
    console.log(chalk.green.bold(`Dist completed in ${buildTime}`))
  })
}
