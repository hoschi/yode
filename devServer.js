var path = require('path')
var express = require('express')
var webpack = require('webpack')
var config = require('./webpack.config.dev')

var app = express()
var compiler = webpack(config)
var port = 9031

app.use(require('webpack-dev-middleware')(compiler, {
    noInfo: true,
    publicPath: config.output.publicPath
}))

app.use(require('webpack-hot-middleware')(compiler))

app.get('*', function (req, res) {
    res.sendFile(path.join(__dirname, 'src/html/index.html'))
})

app.listen(port, '0.0.0.0', function (err) {
    if (err) {
        console.log(err)
        return
    }

    console.log('Listening at http://0.0.0.0:' + port)
})
