/* global __dirname */

var base = require('./webpack.config.base');

module.exports = Object.assign({}, base, {
    devtool: 'source-map'
})
