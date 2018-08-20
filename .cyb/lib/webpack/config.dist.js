/**
 * =================================
 * @2018 塞伯坦-CYB前端模块化工程构建工具
 * https://github.com/jd-cyb/cyb-cli
 * =================================
 */

const webpack = require('webpack')
const path = require('path')
const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin')
const ProgressBarPlugin = require('progress-bar-webpack-plugin')
const safeParser = require('postcss-safe-parser')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const outputPath = require('./output-path')
const config = require('../fezconfig')

module.exports = {
  mode: 'production',
  output: {
    path: outputPath.dist(),
    filename: '[name].[hash].js',
    chunkFilename: path.join(outputPath.js(), '[name].[hash].js')
  },
  module: {
    rules: [{
      test: /\.js$/,
      exclude: /(node_modules|bower_components)/,
      use: [{
        loader: 'fez-preprocess-loader',
        options: {
          available: !config.useMock.dist
        }
      }]
    }]
  },
  optimization: {
    runtimeChunk: {
      name: path.join(outputPath.js(), 'manifest')
    },
    splitChunks: {
      cacheGroups: {
        vendors: {
          name: `vendor-webpack`,
          test: /[\\/]node_modules[\\/]/,
          priority: -10,
          chunks: 'initial'
        },
        common: {
          name: `common-webpack`,
          minChunks: 2,
          priority: -20,
          chunks: 'initial',
          reuseExistingChunk: true
        }
      }
    }
  },
  plugins: [
    new ProgressBarPlugin(),
    //压缩css
    new OptimizeCSSPlugin({
      cssProcessorOptions: {
        parser: safeParser,
        discardComments: {
          removeAll: true
        }
      }
    }),
    //webpack打包档案分析
    ...(config.webpack.analyzer.available ? [new BundleAnalyzerPlugin(config.webpack.options)] : []),
    new webpack.BannerPlugin('@2018 塞伯坦-CYB前端模块化工程构建工具\nhttps://github.com/jd-cyb/cyb-cli'),
    // 根据模块的相对路径生成一个四位数的hash作为模块id
    new webpack.HashedModuleIdsPlugin(),
    // enable scope hoisting
    new webpack.optimize.ModuleConcatenationPlugin()
  ]
}
