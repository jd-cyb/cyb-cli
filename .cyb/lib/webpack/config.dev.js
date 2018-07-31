/**
 * =================================
 * @2018 塞伯坦-CYB前端模块化工程构建工具
 * https://github.com/jd-cyb/cyb-cli
 * =================================
 */

const webpack = require('webpack')
const path = require('path')
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin')
const notifier = require('node-notifier')
const outputPath = require('./output-path')
const config = require('../fezconfig')

module.exports = {
  mode: 'development',
  output: {
    path: outputPath.dev(),
    publicPath: '/'
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
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
  ],
  module: {
    rules: [{
      test: /\.js$/,
      exclude: /(node_modules|bower_components)/,
      use: [{
        loader: 'fez-preprocess-loader',
        options: {
          available: !config.useMock.dev
        }
      }]
    }]
  },
  devtool: 'cheap-module-eval-source-map'
}
