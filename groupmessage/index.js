var uuid = require("uuid");
var _ = require("lodash");
var messaging = require("../messaging");
var freerunning = require("../freerunning")

var lobby = [];
var rooms = [];
var group = {
    clear: function() {
        lobby = [];
        rooms = [];
    },
    joinLobby: function(personId) {
        if (group.isInLobby(personId) || group.isInRoom(personId)) {
            return;
        }

        console.log(personId + " joined lobby");
        //messaging.sendText(personId, "You were joined to lobby");
        lobby.push(personId);
    },
    isPeopleForRoom: function() {
        return lobby.length > 1;
    },
    startRoom: function() {
        peopleArray = lobby.splice(0, 2);
        console.log("Starting room with", peopleArray);

        rooms.push({
            id: uuid.v4(),
            people: peopleArray
        });

        freerunning.getRandomFreerunningStory().then(story => {
            const url = `https://bothack.eu-gb.mybluemix.net/video.html?storyid=${story.id}`;
            const still = story.videos[0].stillimage;
            const title = story.videos[0].title;
            const message = "Hello 🐨 and 🐰\n We all are freerunners. Let’s talk about it. Have you seen this video?";

            return [
                messaging.createVideoTemplate(peopleArray[0], url, still, title),
                messaging.createTextTemplate(peopleArray[0], message),
                messaging.createVideoTemplate(peopleArray[1], url, still, title),
                messaging.createTextTemplate(peopleArray[1], message)
              ].reverse();
        });
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
                messaging.sendText(personId, "🐨 says: " + message);
            }
        });
    },
    disbandRoomWithPerson: function(personId) {
        console.log(personId + " is disbanding the room");
        var foundRooms = _.remove(rooms, function(room) {
            return room.people.indexOf(personId) > -1;
        });

        group.clear();
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
