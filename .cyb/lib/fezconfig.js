/**
 * =================================
 * @2018 塞伯坦-CYB前端模块化工程构建工具
 * https://github.com/jd-cyb/cyb-cli
 * =================================
 */

/**
 * ---------------------------------
 * 工程框架配置文件
 * ---------------------------------
 * 每个项目目录中的配置文件会覆盖此文件中的默认配置
 */

const path = require('path')
const fs = require('fs')
const _ = require('lodash')

const fezConfigDefault = {

  /**
   * -------------------------------
   * 项目目录名称
   * -------------------------------
   */
  projectName: process.cwd().split(path.sep).pop(),

  /**
   * -------------------------------
   * webpack配置
   * -------------------------------
   */
  webpack: {
    /**
     * 相当于webpack.config.js的配置功能
     * 根据需求场景每个项目均可安装loader、plugin及个性化配置
     */
    config: {},
    /**
     * 用于提取合并公共模块
     * {
     *   target: '{打包名称}',
     *   chunk: ['{chunk1名称}','{chunk2名称}','{chunk3名称}']
     * }
     */
    extract: {
      js: []
    },
    /**
     * webpack打包档案分析
     */
    analyzer: {
      available: false,
      options: {}
    },
    /**
     * css-loader配置
     */
    cssLoader: {
      options: {
        sourceMap: true
      }
    },
    /**
     * less-loader配置
     */
    lessLoader: {
      options: {
        sourceMap: true
      }
    },
    /**
     * sass-loader配置
     */
    sassLoader: {
      options: {
        sourceMap: true
      }
    },
    /**
     * stylus-loader配置
     */
    stylusLoader: {
      options: {
        sourceMap: true
      }
    }
  },

  /**
   * 雪碧图配置
   * 配置参考：https://github.com/kisenka/svg-sprite-loader#configuration
   */
  svgSprite: {
    options: {
      publicPath: 'static/svg'
    }
  },

  /**
   * autoprefixer 配置
   * 配置参考：https://github.com/postcss/autoprefixer#options
   */
  autoprefixer: {
    options: {
      browsers: ["> 1%", "last 2 versions", "not ie <= 8"]
    }
  },

  /**
   * -------------------------------
   * 侵入式mock配置
   * /* @if MOCK *\/
   * code...
   * /* @endif *\/
   * -------------------------------
   * 配置参考:
   * https://github.com/furic-zhao/fezmock/wiki
   */
  useMock: {
    dev: false, // dev打包使用Mock数据
    dist: false // dist打包使用Mock数据
  },

  /**
   * -------------------------------
   * 样式编译器配置
   * 仅适用于部署在src/static/styles目录中的样式
   * -------------------------------
   */
  style: {
    /**
     * less配置
     * https://www.npmjs.com/package/gulp-less
     */
    lessOptions: {},

    /**
     * sass配置
     * https://www.npmjs.com/package/gulp-sass
     */
    sassOptions: {},

    /**
     * stylus配置
     * https://github.com/stevelacy/gulp-stylus
     */
    stylusOptions: {}
  },

  /**
   * -------------------------------
   * 启用 PX => REM 自动化转换
   * 如果启用 REM 转换需要在公共样式中对<html>设置基准值
   * 通过 media媒体查询 为 <html> 设置不同值 以实现在不同的屏幕中等比缩放
   * -------------------------------
   */
  useREM: {
    css: {
      available: false, //启用 样式中的 px => rem 转换
      /**
       * 配置参考:
       * https://github.com/cuth/postcss-pxtorem
       */
      options: {
        rootValue: 16, //相对于html根字体大小
        unitPrecision: 5, //允许REM单位增长到的十进制数
        propList: ["*"], //可以从px更改为rem的属性
        selectorBlackList: [], //要忽略的选择器
        replace: true, //替换包含rems的规则，而不是添加fallback
        mediaQuery: false, //允许在媒体查询中转换px
        minPixelValue: 0 //设置要替换的最小像素值
      }
    }
  },

  /**
   * -------------------------------
   * 图片压缩默认配置
   * -------------------------------
   */
  imagemin: {
    jpg: {
      /**
       * jpg图片默认压缩质量
       */
      quality: 85
    },
    gif: {
      /**
       * gif图片默认压缩质量
       */
      optimizationLevel: 1
    },
    png: {}
  },

  /**
   * -------------------------------
   * 压缩ttf
   * -------------------------------
   */
  fontmin: {

    /**
     * 填写需要显示特殊字体的文本内容
     */
    text: ``
  },

  /**
   * -------------------------------
   * 生产环境 启用 图片 => webp 自动化转换
   * -------------------------------
   */
  useWebp: {
    available: false,
    /**
     * 配置参考:
     * https://github.com/imagemin/imagemin-webp
     */
    options: {
      quality: 75, //将质量因子设置为0到100。
      alphaQuality: 100, //将透明度 - 压缩质量设置为0到100。
      method: 4, //指定要使用的压缩方法，介于0（最快）和6（最慢）之间。此参数控制编码速度与压缩文件大小和质量之间的折衷。
      sns: 80, //设置空间噪声整形的幅度在0和100之间
      lossless: false //无损编码图像
    }
  },

  /**
   * -------------------------------
   * 生产环境 启用添加CDN地址前缀
   * -------------------------------
   */
  useCdn: {
    available: false,
    extFile: 'css,html', // 替换CDN地址的文件扩展名
    base: "//cybcdn.com/cdndemo/", // 默认CDN地址
    // js: "http://js.fezcdn.com/", // 脚本CDN地址
    // css: "http://css.fezcdn.com/", // 样式CDN地址
    // images: "http://img.fezcdn.com/", // 图片CDN地址
    // fonts: "http://fonts.fezcdn.com/" // 字体CDN地址
  },

  /**
   * -------------------------------
   * 生产环境 上传sftp服务器配置信息
   * -------------------------------
   */
  sftp: {
    host: "xxx.xxx.xxx.xxx", // ssh服务器地址
    port: "22", // ssh服务器端口号,默认是22
    user: "root", // ssh服务器登录用户名,默认是root
    password: "", // ssh服务器登录密码
    remotePath: "/var/www/html", // 上传到ssh服务器的目录
    includeHtml: true // 是否包含 html 文件
  },

  /**
   * -------------------------------
   * 合并静态资源
   * 仅适用于使用bower安装的第三方框架库资源
   * 及部署在src/common目录中的项目公共脚本
   * 【支持自定义合并多个文件到一个文件】
   * 【支持自定义合并单个文件】
   * 【未配置的文件合并打包成一个文件】
   * 【插入页面顺序以配置顺序降序排列】
   * 【合并顺序以文件配置先后降序排列】
   * -------------------------------
   */
  merge: {
    /**
     * 用于合并使用bower安装的第三方框架库资源
     */
    vendor: {
      available: true, //启用 vendor 文件自动化注入

      /**
       * 合并vendor脚本
       * {
       *    target: '{打包名称}.js',
       *    contain: ['**\/{文件1}.js', '**\/{文件2}.js', '**\/{文件3}.js']
       * }
       */
      js: [],

      /**
       * 合并vendor样式
       * {
       *    target: '{打包名称}.css',
       *    contain: ['**\/{文件1}.css', '**\/{文件2}.css', '**\/{文件3}.css']
       * }
       */
      css: []
    },
    /**
     * 用于合并部署在src/common目录中的项目公共资源
     */
    common: {
      available: true, //启用 common 文件自动化注入

      /*
       * 合并common脚本
       * {
       *    target: '{打包名称}.js',
       *    contain: ['**\/{文件1}', '**\/{文件2}', '**\/{文件3}']
       * }
       */
      js: []
    },

    /**
     * 页面对应的js、css自动注入到页面
     * src/static/styles/{对应的页面名称}.{less,scss,styl,css}
     * src/views/{对应的页面目录名称}/index.js
     */
    page: true //启用 对应页面脚本和样式 自动化注入
  },

  /**
   * -------------------------------
   * 生产环境css压缩配置
   * -------------------------------
   */
  useCssMin: {
    available: true,
    options: {
      safe: true,
      reduceTransforms: false,
      rebase: false,
      advanced: false, // 类型：Boolean 默认：true [是否开启高级优化（合并选择器等）]
      compatibility: "ie8", // 保留ie7及以下兼容写法(hack写法) 类型：String 默认：''or'*' [启用兼容模式； 'ie7'：IE7兼容模式，'ie8'：IE8兼容模式，'*'：IE9+兼容模式]
      keepSpecialComments: 0 // 保留所有特殊前缀 当你用autoprefixer生成的浏览器前缀，如果不加这个参数，有可能将会删除你的部分前缀
    }
  },

  /**
   * -------------------------------
   * 生产环境 html压缩配置
   * -------------------------------
   */
  useHtmlMin: {
    available: true,
    /**
     * 配置参考:
     * https://github.com/kangax/html-minifier
     */
    options: {
      removeComments: true, //清除HTML注释
      collapseWhitespace: true, //压缩HTML
      collapseBooleanAttributes: true, //省略布尔属性的值 <input checked="true"/> ==> <input checked />
      removeEmptyAttributes: true, //删除所有空格作属性值 <input id="" /> ==> <input />
      removeScriptTypeAttributes: true, //删除<script>的type="text/javascript"
      removeStyleLinkTypeAttributes: true, //删除<style>和<link>的type="text/css"
      minifyJS: true, //压缩页面JS
      minifyCSS: true //压缩页面CSS
    }
  },

  /**
   * -------------------------------
   * browsersync配置信息
   * -------------------------------
   */
  browsersync: {
    dev: {
      available: true, // 研发环境是否开启浏览器自动化刷新
      /**
       * 配置参考:
       * http://www.browsersync.cn/docs/options/
       */
      options: {
        port: 8080, // 研发环境 本地服务器的默认端口
        startPath: "zindex.html"
      }
    },
    test: {
      /**
       * 配置参考:
       * http://www.browsersync.cn/docs/options/
       */
      options: {
        port: 8080, // 研发环境 本地服务器的默认端口
        startPath: "zindex.html"
      }
    }
  },

  /**
   * -------------------------------
   * 路径配置
   * -------------------------------
   */
  paths: {
    dir: "./",
    /**
     * 源码目录配置
     */
    src: {
      dir: "./src", //源码根目录

      img: "./src/static/images", //图片目录

      svg: "./src/static/svg", //SVG源文件目录

      fonts: "./src/static/fonts", //字体存放目录

      common: "./src/common", //项目公共库文件

      custom: "./src/custom", //自定义文件目录

      vendor: "./src/vendor", //第三方公共文件库目录

      appJs: "./src/views", //每个页面目录下的index.js 入口文件

      styles: "./src/static/styles",

      html: "./src/views", //所有html文件
    },

    /**
     * 开发目录配置
     */
    dev: {
      dir: "./dev", //开发环境根目录

      common: "./dev/common", //公共库文件生成目录

      custom: "./dev/custom", //自定义文件目录

      appjs: "./dev/static/js", //编译后的业务逻辑存放目录

      css: "./dev/static/css", //编译后的css代码存放目录

      fonts: "./dev/static/fonts", //编译后的字体文件存放目录

      img: "./dev/static/images", //压缩后的图片存放目录

      svg: "./dev/static/svg", //压缩后的图片存放目录

      html: "./dev" //html编译后的存放目录
    },

    /**
     * 缓存目录配置
     */
    tmp: {
      dir: "./tmp", //缓存根目录

      common: "./tmp/common", //公共库文件生成目录

      custom: "./tmp/custom", //自定义文件目录

      appjs: "./tmp/static/js", //编译后的业务逻辑存放目录

      css: "./tmp/static/css", //编译后的css代码存放目录

      fonts: "./tmp/static/fonts", //编译后的字体文件存放目录

      img: "./tmp/static/images", //压缩后的图片存放目录

      svg: "./tmp/static/svg", //处理后的SVG存放目录

      media: "./tmp/static/media", //处理后的SVG存放目录

      html: "./tmp" //html编译后的存放目录
    },

    /**
     * 生产目录配置
     */
    dist: {
      dir: "./dist", //生产环境根目录

      common: "./dist/common", //公共库文件生成目录 (已废弃)

      custom: "./dist/custom", //自定义文件目录

      appjs: "./dist/static/js", //编译后脚本代码存放目录

      css: "./dist/static/css", //编译后的css代码存放目录

      fonts: "./dist/static/fonts", //编译后的字体文件存放目录

      img: "./dist/static/images", //压缩后的图片存放目录

      svg: "./dist/static/svg", //处理后的SVG存放目录

      html: "./dist" //html编译后的存放目录
    },

    /**
     * 测试目录配置
     */
    test: {
      dir: "./test", //测试环境 根目录

      custom: "./test/custom", //自定义文件目录

      appjs: "./test/static/js", //编译后脚本代码存放目录

      css: "./test/static/css", //编译后的css代码存放目录

      fonts: "./test/static/fonts", //编译后的字体文件存放目录

      img: "./test/static/images", //压缩后的图片存放目录

      svg: "./dist/static/svg", //处理后的SVG存放目录

      html: "./test" //html编译后的存放目录
    }
  }
}

const fezConfig = {}

const fezConfigPath = path.resolve(process.cwd(), 'fez.config.js')
const cybConfigPath = path.resolve(process.cwd(), 'cyb.config.js')

if (fs.existsSync(cybConfigPath)) {
  const cybConfigProject = require(cybConfigPath)
  Object.assign(fezConfig, _.defaultsDeep((cybConfigProject.default || cybConfigProject), fezConfigDefault))
} else if (fs.existsSync(fezConfigPath)) {
  const fezConfigProject = require(fezConfigPath)
  Object.assign(fezConfig, _.defaultsDeep((fezConfigProject.default || fezConfigProject), fezConfigDefault))
} else {
  Object.assign(fezConfig, fezConfigDefault)
}

module.exports = fezConfig
