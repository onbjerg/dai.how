const webpack = require('webpack')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const debug = process.env.NODE_ENV !== 'production'

module.exports = {
  context: __dirname,
  devtool: debug ? 'inline-sourcemap' : null,
  entry: './src/index.js',
  output: {
    path: __dirname + '/dist',
    filename: 'bundle.min.js'
  },
  plugins: debug
    ? [
    new CopyWebpackPlugin([
      { from: 'public/', to: '.' }
    ])
  ]
    : [
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.optimize.UglifyJsPlugin({ mangle: false, sourcemap: false }),
    new CopyWebpackPlugin([
      { from: 'public/', to: '.' }
    ])
  ]
}
