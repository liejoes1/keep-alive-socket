// Invalid socket: Too many open files -> 2812 cannot
// connect to localhost port 2812: unknown host (Bad file Descriptor) -> all cannot
var http = require('http');
var fs = require('fs');

// Loading the index file . html displayed to the client
var server = http.createServer(function(req, res) {
    fs.readFile('./index.html', 'utf-8', function(error, content) {
        res.writeHead(200, {"Content-Type": "text/html"});
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
        // Check Message existed earlier.       
        var obj = JSON.parse(fs.readFileSync('./rules.json', 'utf8'));
        for (let i = 0; i < obj.root.error_check.length; i++)
        {
            if (obj.root.error_check[i].name == 'ubuntu_start_tunnel.sh')
            {
                // Data Existed, just put in latest
                obj.root.latest_data.name = obj.root.error_check[i].name;
                obj.root.latest_data.error = obj.root.error_check[i].error;
                // Save the data
                fs.writeFileSync('./rules.json', JSON.stringify(obj));
            }
        }
        console.log('A client is speaking to me! They’re saying: ' + obj.root.error_check[0].name);
        //socket.emit('message', 'You are connected!');
    }); 

    socket.on('disconnect', function (message) {
        //do stuff
        socket.id
        console.log('A client has been disconnected' + message);
    });

});