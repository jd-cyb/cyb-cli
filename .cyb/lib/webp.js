/**
 * =================================
 * @2018 塞伯坦-CYB前端模块化工程构建工具
 * https://github.com/jd-cyb/cyb-cli
 * =================================
 */

/**
 * ---------------------------------
 * 处理WebP任务
 * 生成所有图片的.webp格式
 * 生成.webp.css样式文件
 * 在页面中添加判断是否支持webp的脚本代码
 * 加载对应的样式文件
 * ---------------------------------
 */

/**********************************
 * 用于检测浏览器是否支持webp的脚本源码
 **********************************/
// (function() {
//     //重置页面中的样式为webp.css
//     function setCssLink(sWebp) {
//         var cssLink = document.getElementsByTagName("link");
//         for (var i = 0, linkLen = cssLink.length; i < linkLen; i++) {
//             if (sWebp) {
//                 cssLink[i].href = cssLink[i].getAttribute("data-href").replace(".css", ".webp.css");
//             } else {
//                 cssLink[i].href = cssLink[i].getAttribute("data-href");
//             }
//         }
//     }
//     //检测浏览器是否支持webp
//     function detectionWebp(setCssLink) {
//         var ls = window.localStorage;
//         if (ls !== undefined && ls.supportWebp !== undefined && ls.supportWebp === false) {
//             setCssLink(false);
//             return false
//         } else {
//             if (ls !== undefined && ls.supportWebp !== undefined && ls.supportWebp === true) {
//                 setCssLink(true);
//                 return true;
//             } else {
//                 //检测浏览器是否支持webp
//                 var webp = new Image();
//                 webp.onerror = function() {
//                     //将浏览器支持情况缓存起来
//                     if (ls !== undefined) {
//                         ls.supportWebp = false;
//                     }
//                     setCssLink(false);
//                 };
//                 webp.onload = function() {
//                     //将浏览器支持情况缓存起来
//                     if (ls !== undefined) {
//                         ls.supportWebp = true;
//                     }
//                     setCssLink(true);
//                 };
//                 webp.src = 'data:image/webp;base64,UklGRjIAAABXRUJQVlA4ICYAAACyAgCdASoBAAEALmk0mk0iIiIiIgBoSygABc6zbAAA/v56QAAAAA==';
//             }
//         }
//     }
//     detectionWebp(setCssLink);
// })();

/**
 * 深度遍历目录/列出目录下所有文件
 * https://www.npmjs.com/package/rd
 */
const rd = require('rd')
const fs = require('fs')
const path = require('path')
const gulpWebp = require('gulp-webp')
const rename = require('gulp-rename')
const replace = require('gulp-replace')
const injectString = require('gulp-inject-string')
const gulp = require('gulp')
const async = require('async')

/**
 * 引入 fez.config.js 配置
 */
const config = require('./fezconfig')

module.exports = () => {

  return new Promise((resolve, reject) => {
    const webpScript = `<script>;(function(){function setCssLink(a){var b=document.getElementsByTagName("link");for(var i=0,linkLen=b.length;i<linkLen;i++){if(a){b[i].href=b[i].getAttribute("data-href").replace(".css",".webp.css")}else{b[i].href=b[i].getAttribute("data-href")}}}function detectionWebp(a){var b=window.localStorage;if(b!==undefined&&b.supportWebp!==undefined&&b.supportWebp===false){a(false);return false}else{if(b!==undefined&&b.supportWebp!==undefined&&b.supportWebp===true){a(true);return true}else{var c=new Image();c.onerror=function(){if(b!==undefined){b.supportWebp=false}a(false)};c.onload=function(){if(b!==undefined){b.supportWebp=true}a(true)};c.src='data:image/webp;base64,UklGRjIAAABXRUJQVlA4ICYAAACyAgCdASoBAAEALmk0mk0iIiIiIgBoSygABc6zbAAA/v56QAAAAA=='}}}detectionWebp(setCssLink)})();</script>`

    let webpMap = {} //暂存webp格式的文件
    let imgArr = [] //比较大小之后的webp文件
    let allImages = {} //将所有的图片缓存起来 {"{图片名字}": 1, "{图片名字}": 0} 1 为可优化成 webp
    let reg = null

    function render_webp(src) {
      if (!fs.existsSync(src)) return

      /**
       * 通用查找所有的webp图片
       */
      rd.eachFileSync(src, (file, stats) => {
        const extname = path.extname(file)

        const basename = path.basename(file, extname)

        if (!(basename in webpMap)) {

          webpMap[basename] = {}

          webpMap[basename]['size'] = stats.size

          webpMap[basename]['extname'] = extname
        } else {
          /**
           * 将转换后的 .webp 文件和原文件作比较，找出最小文件(有些转换后比原文件大)
           */
          if ((webpMap[basename]['size'] > stats.size) && (extname === '.webp')) {
            imgArr.push(basename + webpMap[basename]['extname'])

            allImages[basename + webpMap[basename]['extname']] = 1
          } else {
            allImages[basename + webpMap[basename]['extname']] = 0
          }
        }
      })
    }

    /**
     * 将 编译过的 images 目录下的图片转换成 .webp 格式
     */
    function compileWebpImg(cb) {
      const webpConfig = Object.assign({}, config.useWebp.options)

      gulp.src(`${config.paths.tmp.img}/**/*`)
        .pipe(gulpWebp(webpConfig))
        .pipe(gulp.dest(config.paths.tmp.img))
        .on('end', () => {
          cb()
        })
    }
    /**
     * 找到所有编译后的webp图片文件 将文件名赋给正则
     */
    function webpImgNames(cb) {
      render_webp(config.paths.tmp.img)

      if (imgArr.length) {
        reg = eval('/(' + imgArr.join('|') + ')/ig')
      }
      cb()
    }

    /**
     * 将样式中所有的图片地址替换为webp格式，并复制一份命名为webp.css
     */
    function compileWebpCss(cb) {
      gulp.src([`${config.paths.tmp.css}/**/*.css`, `!${config.paths.tmp.css}/**/*.webp.css`])
        .pipe(rename({
          suffix: '.webp'
        }))
        .pipe(replace(reg, (match) => {
          if (match) {
            return match.substring(0, match.lastIndexOf('.')) + '.webp'
          }
        }))
        .pipe(gulp.dest(config.paths.tmp.css))
        .on('end', () => {
          cb()
        })
    }

    /**
     * 将用于检测浏览器是否支持webp的js代码插入到页面
     */
    function injectWebpJs(cb) {
      gulp.src(`${config.paths.tmp.html}/**/*.html`)
        .pipe(replace(/(link.*?)href/ig, '$1data-href'))
        .pipe(injectString.before('</head>', webpScript))
        .pipe(gulp.dest(config.paths.tmp.html))
        .on('end', () => {
          cb()
        })
    }

    async.series([
      function(next) {
        compileWebpImg(next)
      },
      function(next) {
        webpImgNames(next)
      },
      function(next) {
        compileWebpCss(next)
      },
      function(next) {
        injectWebpJs(next)
      }
    ], function(err) {
      if (err) {
        throw new Error(err)
      }
      resolve()
    })
  })
}
