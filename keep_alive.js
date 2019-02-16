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
    let obj = JSON.parse(fs.readFileSync('./rules.json', 'utf8'));
    // When the server receives a “message” type signal from the client   
    socket.on('message', function (message) {
        // Check Message existed earlier.       
        let data = message.toString('utf8');
        // split data
        let splittedData = data.split('\n');

        // remove empty (the end)
        splittedData.pop();

        for (let i = 0; i < splittedData.length; i++) {
            splittedData[i] = {
                "name": splittedData[i].substring(16),
                "orig": splittedData[i],
                "found": false
            }
        }

        // remove duplication
        splittedData = splittedData.filter(function (a) {
            return !this[a.name] && (this[a.name] = true);
        }, Object.create(null));

        

        for (let i = 0; i < splittedData.length; i++) {

            for (let j = 0; j < obj.error_check.length; j++) {
                if (obj.error_check[j].name['name'] == splittedData[i]['name']) {
                    // Data Existed, just put in latest

                    splittedData[i]["found"] = true;
                    obj.latest_data.name = splittedData[i]["orig"];
                    obj.latest_data.error = obj.error_check[j].error;
                    // Save the data
                    fs.writeFileSync('./rules.json', JSON.stringify(obj));

                    // If have error, reset server
                    if (splittedData[i]['error'])
                    {
                        obj.latest_data.name = 'Socket is idle, prepare to reboot';
                        obj.latest_data.error = true;
                        // Save the data
                        fs.writeFileSync('./rules.json', JSON.stringify(obj));
                        // Save Data to the latest update
                        socket.emit('action', 'reboot');
                    }
                }
            }
        }

        for (let i = 0; i < splittedData.length; i++) {
            if (!splittedData[i]["found"]) {
                // New Data need to check first
                if (checkWebsiteStatus()) {
                    // No Problem, just append to the json file     
                    obj['error_check'].push({ "name": splittedData[i], "error": true });              
                }
                else {
                    obj['error_check'].push({ "name": splittedData[i], "error": false });               
                }
                fs.writeFileSync('./rules.json', JSON.stringify(obj));
            }
        }
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
        //console.log(timeDiffinM);
        if (timeDiffinM > 15) {
            obj.latest_data.name = 'Socket is idle, prepare to reboot';
            obj.latest_data.error = true;
            // Save the data
            fs.writeFileSync('./rules.json', JSON.stringify(obj));
            // Save Data to the latest update
            socket.emit('action', 'reboot');
            console.log(timeDiffinM);
        }
    }, 10000);
});

function checkWebsiteStatus() {
    http.get(url_to_check, function (res) {
        // Check Error
        let data = '' + res.statusCode;
        if (data.startsWith('1') || data.startsWith('2') || data.startsWith('3')) {
            return true;
        }
        else {
            return false;
        }
    });
}

function removeDate(orig) {
    for (let i = 0; i < orig.length; i++) {
        orig[i] = orig[i]['name'].substring(16);
    }
}

