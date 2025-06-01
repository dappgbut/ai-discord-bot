var http = require('http');

http.createServer(function (req, res) {
    res.write("im alive");
    res.end();
}).listen(8080);