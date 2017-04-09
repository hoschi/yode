/* global __dirname */

var webpack = require('webpack')
var base = require('./webpack.config.base');

module.exports = Object.assign({}, base, {
    entry: base.entry.concat([
        'eventsource-polyfill', // necessary for hot reloading with IE
        'webpack-hot-middleware/client'
    ]),
    module: {
        rules: [
            base.module.rules[0],
            Object.assign({}, base.module.rules[1], {
                options: {
                    cacheDirectory: '.tmp-babel'
                }
            })
        ]
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin()
    ].concat(base.plugins),
    // didn't create mappable version in chrome
    devtool: 'eval'
//devtool: 'inline-source-map'
})
