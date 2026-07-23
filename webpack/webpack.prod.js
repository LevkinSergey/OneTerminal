/* Production build:
  ========================================================================== */
const { merge } = require('webpack-merge')
const webpack = require('webpack')
const defines = require('./webpack-defines')

// plugins for production build only:
const JsonMinimizerPlugin = require('json-minimizer-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')

// default config
const commonConfigs = require('./webpack.common.js')

module.exports = commonConfigs.entryes.map(value => {
  const curConfig = {
    ...commonConfigs.baseconfig,
    entry: {
      [value.key]: value.path
    }
  }

  return merge(curConfig, {
    mode: 'production',
    devtool: false,
    output: {
      path: defines.dist
    },
    plugins: [
      // compress example:
      // new CompressionPlugin({
      //   exclude: /\/static/,
      // }),
      new webpack.optimize.LimitChunkCountPlugin({
        maxChunks: 1
      })
    ],
    module: {
      rules: []
    },
    performance: {
      hints: false,
      maxEntrypointSize: 512000,
      maxAssetSize: 512000
    },
    optimization: {
      minimize: true,
      minimizer: [
        new JsonMinimizerPlugin(),
        new TerserPlugin(),
        new CssMinimizerPlugin({
          minimizerOptions: {
            // no ie please!
            // targets: { ie: 11 },
            preset: [
              'default',
              {
                discardComments: { removeAll: true }
              }
            ]
          }
        })
      ]
    }
  })
})
