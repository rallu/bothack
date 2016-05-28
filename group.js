var uuid = require("uuid");
var _ = require("lodash");
var request = require("request");

var lobby = [];
var rooms = [];
var group = {
    joinLobby: function(id) {
        sendTextMessage("You were joined to lobby", id);
        lobby.push(id);
        checkForGroupCreate();
    },
    startRoom: function(peopleArray) {
        rooms.push({
            id: uuid.v4(),
            people: peopleArray
        });

        sendTextMessage("Hello! You are group with " + peopleArray[1], peopleArray[0]);
        sendTextMessage("Hello! You are group with " + peopleArray[0], peopleArray[1]);
    },
    disbandRoomWithPerson: function(personId) {
        var foundRooms = _.remove(rooms, function(room) {
            return room.people.indexOf(personId) > -1;
        });

        if (foundRooms.length > 0) {
            foundRooms.forEach(function(room) {
                room.people.forEach(function(personId) {
                    sendTextMessage("You were disbanded from room", personId);
                    group.joinLobby(personId);
                });
            });
        }
    }
};

function checkForGroupCreate() {
    if (lobby.length > 1) {
        //just take two first in group and start chat with them
        var peopleForNewGroup = lobby.splice(0, 2);
        group.startRoom(peopleForNewGroup);
    }
}

function sendTextMessage(sender, text) {
    messageData = {
        text:text
    };
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token:token},
        method: 'POST',
        json: {
            recipient: {id:sender},
            message: messageData,
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error);
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
        }
    });
}

var token = "EAAJhSrhupzsBAGgBIAnEnhTfgSYehmwPf04FD08FKZAoms7pZCFSwLBYDp3w00GKozRu5WfOX6LNHBxIVgfOdsZBZA3B8zRMKK20Oz6jqaWZBAG3PpmXxURVv2qhruAcK6NaUYsNofaKSZBWx43Ez4ZCDoTUfFGhduPpf6cYHbyegZDZD";

module.exports = group;
