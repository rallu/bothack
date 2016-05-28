var uuid = require("uuid");
var _ = require("lodash");
var messaging = require("./messaging");
var emojis = "🐶🐱🐭🐹🐰🐻🐼🐨🐯🦁🐮🐷";
var lobby = [];
var rooms = [];
var group = {
    joinLobby: function(personId) {
        if (group.isInLobby(personId) || group.isInRoom(personId)) {
            return;
        }

        console.log(personId + " joined lobby");
        messaging.sendText(personId, "You were joined to lobby");
        lobby.push(personId);
        checkForGroupCreate();
    },
    startRoom: function(peopleArray) {
        console.log("Starting room with", peopleArray);

        var emo = [];
        peopleArray.forEach(function() {
            emo.push(emojis.charAt(Math.floor(Math.random() * emojis.length)));
        });

        rooms.push({
            id: uuid.v4(),
            people: peopleArray,
            emojis: emo
        });

        messaging.sendText(peopleArray[0], "Hello! You are group with " + emo[1]);
        messaging.sendText(peopleArray[1], "Hello! You are group with " + emo[0]);
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
            messaging.sendText(sender, "You are not in room to talk...");
            return;
        }

        var room = _.find(rooms, function(room) {
            return room.people.indexOf(sender) > -1;
        });
        room.people.forEach(function(personId) {
            if (personId != sender) {
                messaging.sendText(personId, room.emojis[room.people.indexOf(sender)] + " says: " + message);
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
                    messaging.sendText(personId, "You were disbanded from room");
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

module.exports = group;
