// Invalid socket: Too many open files -> 2812 cannot
// connect to localhost port 2812: unknown host (Bad file Descriptor) -> all cannot
var http = require('http');
var fs = require('fs');
var date = require('date-and-time');

const url_to_check = "http://jlie.serveo.net";


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
        // Check Message existed earlier.       
        let data = message.toString('utf8');
        // split data
        let splittedData = data.split('\n');

        // remove empty (the end)
        splittedData.pop();

        // remove date
        let splittedData_date = splittedData.slice(0);
        removeDate(splittedData);
        
        let datafound = false;
        
        var obj = JSON.parse(fs.readFileSync('./rules.json', 'utf8'));
        
        console.log('A client is speaking to me! They’re saying: ' + splittedData_date);

        for (let i = 0; i < splittedData.length; i++)
        {
            for (let j = 0; j < obj.error_check.length; j++) {
                if (obj.error_check[j].name == splittedData[i]) {
                    datafound = true;
                    // Data Existed, just put in latest
                    obj.latest_data.name = splittedData_date[i];
                    obj.latest_data.error = obj.error_check[j].error;
                    // Save the data
                    fs.writeFileSync('./rules.json', JSON.stringify(obj));
                }
            }
        }

        // No data, check website
        if (!datafound) {
            // New Data need to check first
            if (checkWebsiteStatus()) {

                // No Problem, just append to the json file     
                for (let i = 0; i < splittedData.length; i++)
                {
                    obj['error_check'].push({ "name": splittedData[i], "error": true });
                }             
                
            }
            else {
                for (let i = 0; i < splittedData.length; i++)
                {
                    obj['error_check'].push({ "name": splittedData[i], "error": false });
                }
            }
            fs.writeFileSync('./rules.json', JSON.stringify(obj));
        }



        //socket.emit('message', 'You are connected!');
    });

    socket.on('disconnect', function (message) {
        //do stuff
        socket.id
        console.log('A client has been disconnected' + message);
    });
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
    for (let i = 0; i < orig.length; i++)
    {
        orig[i] = orig[i].substring(16);
    }
}