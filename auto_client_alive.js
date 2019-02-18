const io = require('socket.io-client');

var socket = io.connect('http://localhost:8080');

socket.on('action', function(message) {
    console.log(message);
});