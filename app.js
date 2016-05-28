/*eslint-env node*/

var express = require('express');
var bodyParser = require('body-parser');
var messaging = require('./messaging');
var videos = require('./videos');

// cfenv provides access to your Cloud Foundry environment
// for more info, see: https://www.npmjs.com/package/cfenv
var cfenv = require('cfenv');

// create a new express server
var app = express();
var group = require("./group.js");
var fb = require("./fb");

// serve the files out of ./public as our main files
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.get('/webhook/', function (req, res) {
    if (req.query['hub.verify_token'] === 'haha_i_have_token') {
        res.send(req.query['hub.challenge']);
    }
    res.send('Error, wrong token');
});

app.post('/webhook/', function (req, res) {
    console.log('Body: ' + JSON.stringify(req.body));

    messaging_events = req.body.entry[0].messaging;
    for (i = 0; i < messaging_events.length; i++) {
        event = req.body.entry[0].messaging[i];
        sender = event.sender.id;
        if (event.message && event.message.text) {
            var text = event.message.text;
            if (text == "join") {
                group.joinLobby(event.sender.id);
            }
            else if (text == "leave") {
                group.disbandRoomWithPerson(event.sender.id);
            }
            else if (text.substr(0,4) == "send") {
                group.sendMessageToRoom(event.sender.id, text.substr(5));
            }
            else {
                var video = videos[0];
                messaging.sendText(sender, "Echo: " + text.substring(0, 200))
                    .then(resonse => messaging.sendVideo(sender, video.url, video.thumbnail, video.title));
            }
        }
    }
    res.sendStatus(200);
});

app.get("/info/:id", function(req, res) {
    fb.getUserInfo(req.params.id).then(response => res.send(response));
});

var freerunning = require("./freerunning");
app.get("/randstory", function(req, res) {
    freerunning.getRandomFreerunningStory().then(story => res.send(story));
});

// get the app environment from Cloud Foundry
var appEnv = cfenv.getAppEnv();

// start server on the specified port and binding host
app.listen(appEnv.port, '0.0.0.0', function() {
  // print a message when the server starts listening
  console.log("server starting on " + appEnv.url);
});
