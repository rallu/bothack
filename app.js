'use strict';
/*eslint-env node*/

const express = require('express');
const bodyParser = require('body-parser');
const Promise = require('bluebird');
const Dialog = require('./dialog');
const groups = require('./groupmessage');

// cfenv provides access to your Cloud Foundry environment
// for more info, see: https://www.npmjs.com/package/cfenv
var cfenv = require('cfenv');

// create a new express server
var app = express();
var fb = require("./fb");

const dialogs = {};

function processEvent(event) {
    var sender = event.sender.id;

    return new Promise((resolve, reject) => {
        var profile;
        var dialog;

        if (dialogs[sender]) {
            return resolve(dialogs[sender]);
        }

        return fb.getUserInfo(sender)
        .then(_profile => profile = _profile)
        .then(() => {
            profile.id = sender;
            dialog = new Dialog(profile);
            dialogs[sender] = dialog;

            return dialog.init();
        })
        .then(() => groups.joinLobby(profile.id))
        .then(() => resolve(dialog))
    })
    .then(dialog => {
        console.log('Handle message');
        if (event.message && event.message.text) {
            var text = event.message.text;

            // If the person is in lobby, use dialog. Otherwise use group msg
            if (!groups.isInRoom(sender)) {
                return dialog.hear(text);
            }

            if (text.indexOf("friend") > -1) {
                console.log("Sending friend request");
                return groups.requestFriendForm(sender);
            } else {

                if (text.indexOf("event") > -1) {
                    groups.sendEventMessage(sender);
                }

                // Otherwise direct it to the room
                return groups.sendMessageToRoom(sender, text);
            }

        }

        Promise.reject('Could not handle event');
    });
}

// serve the files out of ./public as our main files
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.get('/webhook/', function (req, res) {
    console.log(req.body);

    if (req.query['hub.verify_token'] === 'haha_i_have_token') {
        res.send(req.query['hub.challenge']);
    }
    res.send('Error, wrong token');
});

app.post('/webhook/', function (req, res) {
    //console.log('Body: ' + JSON.stringify(req.body));

    // Be cruel, just pick the first event
    var messaging_events = req.body.entry[0].messaging;
    var event = messaging_events[0];

    if (event.message && event.message.text == "reset") {
        const dialogs = {};
        groups.clear();
        return res.sendStatus(200);
    }

    return processEvent(event)
        .then(data => {
            return res.sendStatus(200);
        })
        .catch(error => {
            console.warn('Response not handled', error.message);
            console.warn(error.stack);
            return res.sendStatus(200);
        })
        .finally(() => {
            //console.log('All done');
        });
});

app.get("/info/:id", function(req, res) {
    fb.getUserInfo(req.params.id).then(response => res.send(response));
});

var freerunning = require("./freerunning");
app.get("/randstory", function(req, res) {
    freerunning.getRandomFreerunningStory().then(story => res.send(story));
});

app.get("/story/:id", function(req, res) {
    freerunning.getStory(req.params.id).then(story => res.send(story));
});

// get the app environment from Cloud Foundry
var appEnv = cfenv.getAppEnv();

// start server on the specified port and binding host
app.listen(appEnv.port, '0.0.0.0', function() {
  // print a message when the server starts listening
  console.log("server starting on " + appEnv.url);
});
