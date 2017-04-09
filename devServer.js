var path = require('path')
var express = require('express')
var webpack = require('webpack')
var config = require('./webpack.config.dev')
var webpackDevMiddleware = require('webpack-dev-middleware');

var app = express()
var compiler = webpack(config)
var port = 9031


var devMiddleware = webpackDevMiddleware(compiler, {
    noInfo: true,
    publicPath: config.output.publicPath
})

app.use(devMiddleware)

app.use(require('webpack-hot-middleware')(compiler))

app.get('*', (req, res) => {
    const index = devMiddleware.fileSystem.readFileSync(path.join(config.output.path, 'index.html'));
    res.end(index);
});

app.listen(port, '0.0.0.0', function (err) {
    if (err) {
        console.log(err)
        return
    }

    console.log('Listening at http://0.0.0.0:' + port)
})
