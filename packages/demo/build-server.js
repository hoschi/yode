let express = require('express')
let server = express()
server.use('/yode', express.static(__dirname + '/build'))
server.listen(9032)
