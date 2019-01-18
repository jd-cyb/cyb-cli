const fs = require('fs')
const path = require('path')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const postcssPxtorem = require('postcss-pxtorem')

const config = require('../fezconfig')
const checkPostcssConfig = fs.existsSync(path.join(process.cwd(), './postcss.config.js'))

//是否是生产环境
const isProduction = process.env.NODE_ENV === 'production'

function commonLoader({
  cssLoaderOptions = {
    importLoaders: 2
  }
}) {

  return [
    ...(isProduction ? [MiniCssExtractPlugin.loader] : [{
      loader: 'vue-style-loader'
    }]),
    {
      loader: 'css-loader',
      options: Object.assign({}, config.webpack.cssLoader.options, cssLoaderOptions)
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
          require('autoprefixer')(config.autoprefixer.options)
        ]
      }
    }])
  ]
}

module.exports = [{
    test: /\.(scss|sass)$/,
    exclude: [/\.global\./, /node_modules/],
    use: [
      ...commonLoader({}),
      {
        loader: 'sass-loader',
        options: config.webpack.sassLoader.options
      }
    ]
  },
  {
    test: /\.(scss|sass)$/,
    include: [/\.global\./, /node_modules/],
    use: [
      ...commonLoader({
        cssLoaderOptions: {
          modules: false
        }
      }),
      {
        loader: 'sass-loader',
        options: config.webpack.sassLoader.options
      }
    ]
  },
  {
    test: /\.(scss|sass)$/,
    include: [/\.module\./],
    use: [
      ...commonLoader({
        cssLoaderOptions: {
          modules: true
        }
      }),
      {
        loader: 'sass-loader',
        options: config.webpack.sassLoader.options
      }
    ]
  },
  {
    test: /\.less$/,
    exclude: [/\.global\./, /node_modules/],
    use: [
      ...commonLoader({}),
      {
        loader: 'less-loader',
        options: config.webpack.lessLoader.options
      }
    ]
  },
  {
    test: /\.less$/,
    include: [/\.global\./, /node_modules/],
    use: [
      ...commonLoader({
        cssLoaderOptions: {
          modules: false
        }
      }),
      {
        loader: 'less-loader',
        options: config.webpack.lessLoader.options
      }
    ]
  },
  {
    test: /\.less$/,
    include: [/\.module\./],
    use: [
      ...commonLoader({
        cssLoaderOptions: {
          modules: true
        }
      }),
      {
        loader: 'less-loader',
        options: config.webpack.lessLoader.options
      }
    ]
  },
  {
    test: /\.styl$/,
    exclude: [/\.global\./, /node_modules/],
    use: [
      ...commonLoader({}),
      {
        loader: 'stylus-loader',
        options: config.webpack.stylusLoader.options
      }
    ]
  },
  {
    test: /\.styl$/,
    include: [/\.global\./, /node_modules/],
    use: [
      ...commonLoader({
        cssLoaderOptions: {
          modules: false
        }
      }),
      {
        loader: 'stylus-loader',
        options: config.webpack.stylusLoader.options
      }
    ]
  },
  {
    test: /\.styl$/,
    include: [/\.module\./],
    use: [
      ...commonLoader({
        cssLoaderOptions: {
          modules: true
        }
      }),
      {
        loader: 'stylus-loader',
        options: config.webpack.stylusLoader.options
      }
    ]
  },
  {
    test: /\.css$/,
    exclude: [/\.global\./, /node_modules/],
    use: [
      ...commonLoader({
        cssLoaderOptions: {
          importLoaders: 1
        }
      })
    ]
  },
  {
    test: /\.css$/,
    include: [/\.global\./, /node_modules/],
    use: [
      ...commonLoader({
        cssLoaderOptions: {
          modules: false,
          importLoaders: 1
        }
      })
    ]
  },
  {
    test: /\.css$/,
    include: [/\.module\./],
    use: [
      ...commonLoader({
        cssLoaderOptions: {
          modules: true,
          importLoaders: 1
        }
      })
    ]
  }
]
