/* global __dirname */

var path = require('path')
var webpack = require('webpack')
var HtmlWebpackPlugin = require('html-webpack-plugin');

var dir_js = path.resolve(__dirname, 'src/')
var dir_base = path.resolve(__dirname);
var dir_root = path.resolve(__dirname, '../../')
var dir_build = path.resolve(__dirname, 'build')
var dir_core = path.resolve(dir_root, 'packages/core/')
var dir_nodeModules = path.resolve(__dirname, 'node_modules')
var file_indexHtml = path.resolve(__dirname, 'src/index.html')
var file_favicon = path.resolve(__dirname, 'src/assets/favicon.ico')

module.exports = {
    entry: [
        path.resolve(dir_js, 'index.js')
    ],
    output: {
        path: dir_build,
        filename: '[name].bundle.js',
        sourceMapFilename: '[name].map',
        publicPath: '/'
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    'css-loader'
                ]
            },
            {
                loader: 'babel-loader',
                exclude: dir_nodeModules,
                test: /\.js$/
            }
        ]
    },
    plugins: [
        new webpack.NoEmitOnErrorsPlugin(),
        new HtmlWebpackPlugin({
            template: file_indexHtml,
            hash: false,
            favicon: file_favicon,
            filename: 'index.html',
            inject: 'body',
            minify: {
                collapseWhitespace: false
            }
        })
    ],
    // make absolute import statements possible, also for local modules
    resolve: {
        modules: [
            dir_base,
            dir_js,
            'node_modules'
        ],
        alias: {
            'yode-core': dir_core
        }
    },
    stats: {
        // Nice colored output
        colors: true
    }
}
