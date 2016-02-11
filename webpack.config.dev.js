/* global __dirname */

var path = require('path')

var webpack = require('webpack')

var dir_js = path.resolve(__dirname, 'src/js')
var dir_build = path.resolve(__dirname, 'build')

module.exports = {
    entry: [
        'eventsource-polyfill', // necessary for hot reloading with IE
        'webpack-hot-middleware/client',
        path.resolve(dir_js, 'index.js')
    ],
    output: {
        path: dir_build,
        filename: 'bundle.js',
        publicPath: '/static/'
    },
    module: {
        loaders: [
            {
                loaders: ['babel'],
                test: dir_js
            }
        ]
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoErrorsPlugin()
    ],
    stats: {
        // Nice colored output
        colors: true
    },
    devtool: 'cheap-module-eval-source-map'
}