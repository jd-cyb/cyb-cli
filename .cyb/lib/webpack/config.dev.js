/**
 * =================================
 * @2018 塞伯坦-CYB前端模块化工程构建工具
 * https://github.com/jd-cyb/cyb-cli
 * =================================
 */

const webpack = require('webpack')
const path = require('path')
const outputPath = require('./output-path')
const config = require('../fezconfig')

module.exports = {
  mode: 'development',
  output: {
    path: outputPath.dev(),
    filename: '[name].js',
    chunkFilename: path.join(outputPath.js(), '[name].js'),
    publicPath: '/'
  },
  plugins: [
    new webpack.ProgressPlugin(),
    new webpack.HotModuleReplacementPlugin()
  ],
  module: {
    rules: [...(config.useMock.dev ? [{
      test: /\.(js|jsx|ts)$/,
      exclude: /(node_modules|bower_components)/,
      use: [{
        loader: 'fez-preprocess-loader',
        options: {
          available: !config.useMock.dev
        }
      }]
    }] : [])]
  },
  devtool: 'cheap-module-eval-source-map'
}
