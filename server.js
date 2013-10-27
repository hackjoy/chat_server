var http = require('http'); // HTTP server and client functionality
var fs = require('fs');     // filesystem related functionality
var path = require('path');   // filesystem path related functionality
var mime = require('mime'); // the ability to derive a MIME type based on a filename extension
var cache = {};             // cache object is where the contents of cached files are stored

// helper function to return 404 page
function send404(response) {
    response.writeHead(404, {'Content-Type': 'text/plain'});
    response.write('Error 404: resource not found.');
    response.end();
}

// writes http headers and serves fle data
function sendFile(response, filePath, fileContents) {
    response.writeHead(
        200,
        {"content-type": mime.lookup(path.basename(filePath))}
    );
    response.end(fileContents);
}

// serving static files
function serveStatic(response, cache, absPath) {
    if (cache[absPath]) { // if the file is in the cache send it
        sendFile(response, absPath, cache[absPath]);
    } else {
        fs.exists(absPath, function(exists) { // check if the path exists in filesystem
            if (exists) {
                fs.readFile(absPath, function(err, data) {
                    if (err) {
                        send404(response);
                    } else {
                        cache[absPath] = data;
                        sendFile(response, absPath, data);
                    }
                });
            } else {
                send404(response);
            }
        });
    }
}

// logic to create http server
var server = http.createServer(function(request, response) {
    var filePath = false;
    if (request.url == '/') {
        filePath = 'public/index.html';
    } else {
        filePath = 'public' + request.url;
    }
    var absPath = './' + filePath;
    serveStatic(response, cache, absPath);
});

// function run once 'node server.js' executed
server.listen(3000, function() {
    console.log('Server listening on port 3000.');
});
