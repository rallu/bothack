var uuid = require("uuid");
var _ = require("lodash");
var request = require("request");

var lobby = [];
var rooms = [];
var group = {
    joinLobby: function(personId) {
        if (group.isInLobby(personId) || group.isInRoom(personId)) {
            return;
        }

        console.log(personId + " joined lobby");
        sendTextMessage(personId, "You were joined to lobby");
        lobby.push(personId);
        checkForGroupCreate();
    },
    startRoom: function(peopleArray) {
        console.log("Starting room with", peopleArray);
        rooms.push({
            id: uuid.v4(),
            people: peopleArray
        });

        sendTextMessage(peopleArray[0], "Hello! You are group with " + peopleArray[1]);
        sendTextMessage(peopleArray[1], "Hello! You are group with " + peopleArray[0]);
    },
    isInLobby: function(personId) {
        return lobby.indexOf(personId) > -1;
    },
    isInRoom: function(personId) {
        var foundRooms = _.find(rooms, function(room) {
            return room.people.indexOf(personId) > -1;
        });
        return foundRooms && foundRooms.id != null;
    },
    sendMessageToRoom: function(sender, message) {
        if (!group.isInRoom(sender)) {
            sendTextMessage(sender, "You are not in room to talk...");
            return;
        }

        var room = _.find(rooms, function(room) {
            return room.people.indexOf(sender) > -1;
        });
        room.people.forEach(function(personId) {
            if (personId != sender) {
                sendTextMessage(personId, "Other says: " + message);
            }
        });
    },
    disbandRoomWithPerson: function(personId) {
        console.log(personId + " is disbanding the room");
        var foundRooms = _.remove(rooms, function(room) {
            return room.people.indexOf(personId) > -1;
        });

        if (foundRooms.length > 0) {
            foundRooms.forEach(function(room) {
                room.people.forEach(function(personId) {
                    sendTextMessage(personId, "You were disbanded from room");
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
    console.log("Sending message '" + text + "' to " + sender);
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
