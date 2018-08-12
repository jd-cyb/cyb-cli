/**
 * =================================
 * @2018 塞伯坦-CYB前端模块化工程构建工具
 * https://github.com/jd-cyb/cyb-cli
 * =================================
 */

const path = require('path')
const webpack = require('webpack')
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin')
const notifier = require('node-notifier')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const babelrc = require('./babelrc')
const config = require('../fezconfig')
const outputPath = require('./output-path')
const fs = require('fs')

//是否是生产环境
const isProduction = process.env.NODE_ENV === 'production'

const checkPostcssConfig = fs.existsSync(path.join(process.cwd(), './postcss.config.js'))

const webpackConfig = {
  context: path.join(__dirname, '../../../'),
  /**
   * 打包性能提示
   */
  performance: {
    hints: false
  },
  output: {},
  entry: {},
  /**
   * 模块解析
   */
  resolve: {
    extensions: [".js", ".json"],
    modules: [path.join(process.cwd(), "src"), path.join(__dirname, '../../../', 'node_modules'), path.join(process.cwd(), 'node_modules'), "node_modules"]
  },
  /**
   * loader解析
   */
  resolveLoader: {
    modules: [path.join(__dirname, '../../../', 'node_modules'), path.join(process.cwd(), 'node_modules'), "node_modules"]
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: [{
          loader: 'babel-loader',
          options: babelrc
        }]
      },
      {
        test: /\.(png|jpe?g|gif)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: isProduction ? '[name].[hash].[ext]' : '[name].[ext]',
          outputPath: outputPath.images()
        }
      },
      {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: isProduction ? '[name].[hash].[ext]' : '[name].[ext]',
          outputPath: outputPath.media()
        }
      },
      {
        test: /((\.(woff2?|eot|ttf|otf))|((fonts|font)\/(.*?)\.svg))(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: isProduction ? '[name].[hash].[ext]' : '[name].[ext]',
          outputPath: outputPath.fonts()
        }
      },
      {
        test: /\.(scss|sass)$/,
        use: [
          ...(isProduction ? [MiniCssExtractPlugin.loader] : [{ loader: 'style-loader' }]),
          {
            loader: 'css-loader',
            options: {
              url: true,
              sourceMap: true
            }
          },
          ...(checkPostcssConfig ? [{
            loader: 'postcss-loader',
            options: {
              sourceMap: true
            }
          }] : [{
            loader: 'postcss-loader',
            options: {
              ident: 'postcss',
              plugins: (loader) => [
                ...(config.useREM.css.available ? [postcssPxtorem(Object.assign({}, config.useREM.css.options))] : []),
                require('autoprefixer')(Object.assign({}, config.style.autoprefixerOptions))
              ]
            }
          }]), {
            loader: 'sass-loader',
            options: {
              sourceMap: true
            }
          }
        ]
      },
      {
        test: /\.less$/,
        use: [
          ...(isProduction ? [MiniCssExtractPlugin.loader] : [{ loader: 'style-loader' }]),
          {
            loader: 'css-loader',
            options: {
              url: true,
              sourceMap: true
            }
          }, ...(checkPostcssConfig ? [{
            loader: 'postcss-loader',
            options: {
              sourceMap: true
            }
          }] : [{
            loader: 'postcss-loader',
            options: {
              ident: 'postcss',
              plugins: (loader) => [
                ...(config.useREM.css.available ? [postcssPxtorem(Object.assign({}, config.useREM.css.options))] : []),
                require('autoprefixer')(Object.assign({}, config.style.autoprefixerOptions))
              ]
            }
          }]), {
            loader: 'less-loader',
            options: {
              sourceMap: true
            }
          }
        ]
      },
      {
        test: /\.styl$/,
        use: [
          ...(isProduction ? [MiniCssExtractPlugin.loader] : [{ loader: 'style-loader' }]),
          {
            loader: 'css-loader',
            options: {
              url: true,
              sourceMap: true
            }
          }, ...(checkPostcssConfig ? [{
            loader: 'postcss-loader',
            options: {
              sourceMap: true
            }
          }] : [{
            loader: 'postcss-loader',
            options: {
              ident: 'postcss',
              plugins: (loader) => [
                ...(config.useREM.css.available ? [postcssPxtorem(Object.assign({}, config.useREM.css.options))] : []),
                require('autoprefixer')(Object.assign({}, config.style.autoprefixerOptions))
              ]
            }
          }]), {
            loader: 'stylus-loader',
            options: {
              sourceMap: true
            }
          }
        ]
      },
      {
        test: /\.css$/,
        use: [
          ...(isProduction ? [MiniCssExtractPlugin.loader] : [{ loader: 'style-loader' }]),
          {
            loader: 'css-loader',
            options: {
              url: true,
              sourceMap: true
            }
          }, ...(checkPostcssConfig ? [{
            loader: 'postcss-loader',
            options: {
              sourceMap: true
            }
          }] : [{
            loader: 'postcss-loader',
            options: {
              ident: 'postcss',
              plugins: (loader) => [
                ...(config.useREM.css.available ? [postcssPxtorem(Object.assign({}, config.useREM.css.options))] : []),
                require('autoprefixer')(Object.assign({}, config.style.autoprefixerOptions))
              ]
            }
          }])
        ]
      }
    ]
  },
  plugins: [
    /**
     * 提取JS中引入的样式
     * 提取后的文件将会被保存在dist/static/js/目录
     */
    ...(isProduction ? [new MiniCssExtractPlugin({
      filename: path.join(outputPath.css(), '[name].[hash].css'),
      chunkFilename: path.join(outputPath.css(), '[name].[hash].css')
    })] : []),

    /**
     * webpack错误提示
     */
    new FriendlyErrorsWebpackPlugin({
      compilationSuccessInfo: {
        messages: [],
      },
      onErrors: (severity, errors) => {
        if (severity !== 'error') {
          return;
        }
        const error = errors[0];
        notifier.notify({
          title: `${config.projectName} 编译出错`,
          message: severity + ': ' + error.name,
          subtitle: error.file || '',
          icon: path.join(__dirname, '../', 'cyb-logo.png')
        });
      }
    })
  ]
}

module.exports = webpackConfig
