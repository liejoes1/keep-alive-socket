// Invalid socket: Too many open files -> 2812 cannot
// connect to localhost port 2812: unknown host (Bad file Descriptor) -> all cannot
var http = require('http');
var fs = require('fs');
const url_to_check = "http://jlie.serveo.net:2812";


// Loading the index file . html displayed to the client
var server = http.createServer(function (req, res) {
    fs.readFile('./index.html', 'utf-8', function (error, content) {
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(content);
    });
});

// Loading socket.io
var io = require('socket.io').listen(server);

// When a client connects, we note it in the console
io.sockets.on('connection', function (socket) {
    console.log('A client is connected!');
});


server.listen(8080);

io.sockets.on('connection', function (socket) {
    // When the server receives a “message” type signal from the client   
    socket.on('message', function (message) {
        
    });

    socket.on('disconnect', function (message) {
        // Either reboot or critical error
        obj.latest_data.name = 'Socket is disconnected';
        obj.latest_data.error = true;
        // Save the data
        fs.writeFileSync('./rules.json', JSON.stringify(obj));
        console.log('A client has been disconnected' + message);
    });

    // Socket Idle Handler
    setInterval(function () {
        let timeDiffinM = (new Date().getTime() - fs.statSync("./rules.json").mtimeMs) / 60000;
        console.log(timeDiffinM);
        //console.log(timeDiffinM);
        socket.emit('action', 'reboot');
        if (timeDiffinM > 15) {
            obj.latest_data.name = 'Socket is idle, prepare to reboot';
            obj.latest_data.error = true;
            // Save the data
            fs.writeFileSync('./rules.json', JSON.stringify(obj));
            // Save Data to the latest update
            socket.emit('action', 'reboot');
        }
    }, 10000);
});