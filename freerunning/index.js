const request = require('request-promise-lite');

var url = "http://api.redbull.com/v2/stories/tags/freerunning/contain/videos";

var Promise = require("bluebird");

module.exports = {
    getRandomFreerunningStory: function() {
        return new Promise(function(resolve, reject) {
            request.get(url, { json: true })
                .then(response => {
                    if (response.stories) {
                        var randindex = Math.floor(Math.random() * response.stories.length);
                        var story = response.stories[randindex];
                        resolve(story);
                    } else {
                        reject("no-stories");
                    }
                })
                .catch(reject);
        });
    },
    getStory: function(id) {
        return new Promise(function(resolve, reject) {
            request.get("http://api.redbull.com/v2/stories/" + id, { json: true })
                .then(response => {
                    resolve(response.stories[0])
                })
                .catch(reject);
        });
    }
};
