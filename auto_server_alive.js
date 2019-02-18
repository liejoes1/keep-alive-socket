var http = require('http');
var fs = require('fs');
const url_to_check = "http://google.net";

// Loading the index file . html displayed to the client
var server = http.createServer();
server.listen(8080);

// Loading socket.io
const io = require('socket.io').listen(server);

io.sockets.on('connection', function (socket) {
    console.log('A client is connected!');

    checkWebsiteStatus(function (res){
        socket.emit('action', res);
    })
    

    

    socket.on('message', function (message) {

    });

    socket.on('disconnect', function (message) {

    });
});

function checkWebsiteStatus(callback) {

    var handleError = http.get(url_to_check, function (res) {
        // Check Error
        let data = '' + res.statusCode;
        if (data.startsWith('1') || data.startsWith('2') || data.startsWith('3')) {
            return callback(true);
        }
        return callback(false);
    });

    handleError.on('error', function (err) {
        return callback(false);
    });
}

