/* global __dirname */

var base = require('./webpack.config.base')

module.exports = Object.assign({}, base, {
    output: Object.assign({}, base.output, {
        publicPath: '/yode/'
    }),
    devtool: 'source-map'
})
