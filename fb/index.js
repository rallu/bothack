var FB = require("fb");
var Promise = require("bluebird");
const token = "EAAJhSrhupzsBAGgBIAnEnhTfgSYehmwPf04FD08FKZAoms7pZCFSwLBYDp3w00GKozRu5WfOX6LNHBxIVgfOdsZBZA3B8zRMKK20Oz6jqaWZBAG3PpmXxURVv2qhruAcK6NaUYsNofaKSZBWx43Ez4ZCDoTUfFGhduPpf6cYHbyegZDZD";
FB.setAccessToken(token);

module.exports = {
    getUserInfo: function(id) {
        return new Promise(function(resolve, reject) {
            FB.api("/" + id, function(response) {
                if (response.error) {
                    return reject(response.error);
                }
                resolve(response);
            });
        });
    }
};
