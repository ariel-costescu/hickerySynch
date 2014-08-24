var https = require("https");
var fs = require('fs');

var createBody = function (playlistId, id, title, sequence) {
    return {
        "playlistId" : playlistId,
        "song" : {
            "id" : id,
            "duration" : 171,
            "title" : title,
            "author" : "",
            "type" : 1,
            "highDefinition" : true,
            "prettyDuration" : "02:51",
            "url" : "https://youtu.be/" + id,
            "cleanTitle" : title
        },
        "sequence" : sequence,
        "id" : null,
        "title" : title,
        "selected" : false,
        "firstSelected" : false,
        "cid" : "c414"
    };
};

var playlistId = "310df56d-d23a-47ed-b099-a39001752c91";

var headers = {
    "Host" : "aws-server.streamus.com",
    "Connection" : "keep-alive",
    "Accept" : "application/json, text/javascript, */*; q=0.01",
    "Origin" : "chrome-extension://jbnkffmindojffecdhbbmekbmkkfpmjd",
    "User-Agent" : "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/36.0.1985.143 Safari/537.36",
    "Content-Type" : "application/json",
    "Accept-Encoding" : "gzip,deflate,sdch",
    "Accept-Language" : "en-US,en;q=0.8,ro;q=0.6,fr-FR;q=0.4,fr;q=0.2",
    "Cookie" : "_ga=GA1.2.1751637508.1408794873; __zlcmid=OVdhkYC70vehqK"
};

var awsServer = {
    host : 'aws-server.streamus.com',
    port : 443,
    path : '/Streamus/PlaylistItem/',
    method : 'POST',
    headers : headers
};

var playlist = JSON.parse(fs.readFileSync('playlist.js', 'utf8'));

var payloads = [];

playlist.forEach(function (val, index, arr) {
    if (val.provider === "youtube") {
        var id = val.file;
        var title = val.title;
        var sequence = 10000 * (index + 1);
        var body = createBody(playlistId, id, title, sequence);

        var contentLength = JSON.stringify(body).length;

        payloads.push({
            "body" : body,
            "contentLength" : contentLength
        });

    }
});

var delay = 1000; //ms

var interval = setInterval(function() {
    if (payloads.length == 0) {
        clearInterval(interval);
    } else {
        var payload = payloads.shift();
        awsServer.headers["Content-Length"] = payload.contentLength;
        
        console.log("trying id=" + payload.body.song.id);
        
        var req = https.request(awsServer, function(res) {
            res.setEncoding('utf8');
            res.on('data', function (chunk) {
                console.log('response status ' + res.statusCode);
                console.log('response body ' + chunk);
            });
        });
        
        req.on('error', function(e) {
            console.log('problem with request: ' + e.message + "\nrequest was " + req);
        });
        
        req.end(JSON.stringify(payload.body));
    }
}, delay);