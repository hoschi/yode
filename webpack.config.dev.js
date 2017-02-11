/* global __dirname */

var path = require('path')

var webpack = require('webpack')

var dir_js = path.resolve(__dirname, 'src/js')
var dir_base = path.resolve(__dirname);
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
                test: /\.css$/,
                loader: 'style-loader!css-loader'
            },
            {
                test: /\.json$/,
                loader: 'json-loader'
            },
            {
                loader: 'babel',
                query: {
                    cacheDirectory: '.tmp-babel'
                },
                exclude: 'node_modules',
                test: dir_js
            }
        ]
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoErrorsPlugin()
    ],
    // make absolute import statements possible, also for local modules
    resolve: {
        extensions: ['', '.js'],
        modulesDirectories: ['src/js/', 'node_modules'],
        root: dir_base
    },
    stats: {
        // Nice colored output
        colors: true
    },
    // didn't create mappable version in chrome
    devtool: 'eval'
//devtool: 'eval-source-map'
}
