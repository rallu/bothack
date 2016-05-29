'use strict';

const request = require('request-promise-lite');
const token = "EAAJhSrhupzsBAGgBIAnEnhTfgSYehmwPf04FD08FKZAoms7pZCFSwLBYDp3w00GKozRu5WfOX6LNHBxIVgfOdsZBZA3B8zRMKK20Oz6jqaWZBAG3PpmXxURVv2qhruAcK6NaUYsNofaKSZBWx43Ez4ZCDoTUfFGhduPpf6cYHbyegZDZD";

function sendTemplate(template) {
    const url = `https://graph.facebook.com/v2.6/me/messages?access_token=${token}`;
    const options = { json: true, body: template };

    return request.post(url, options);
}

function createVideoTemplate(clientId, url, thumbnail, title) {
    return {
        "recipient": {
            "id": clientId
        },
        "message": {
            "attachment": {
                "type": "template",
                "payload": {
                    "template_type": "generic",
                    "elements": [
                        {
                            "title": title,
                            "image_url": thumbnail,
                            "buttons": [
                                {
                                    "type": "web_url",
                                    "url": url,
                                    "title": "Watch"
                                }
                            ]
                        }
                    ]
                }
            }
        }
    };
}

function createFriendRequestTemplate(clientId) {
    return {
        "recipient": {
            "id": clientId
        },
        "message": {
            "attachment": {
                "type": "template",
                "payload": {
                    "template_type": "generic",
                    "elements": [
                        {
                            "title": "Would you like to friend anonymous chatter?",
                            "buttons": [
                                {
                                    "type": "web_url",
                                    "url": "https://www.facebook.com/marco.suvanto",
                                    "title": "Yes"
                                },
                                {
                                    "type": "postback",
                                    "payload": "NO",
                                    "title": "No"
                                }
                            ]
                        }
                    ]
                }
            }
        }
    };
}

function createEventTemplate(clientId) {
    return {
        "recipient": {
            "id": clientId
        },
        "message": {
            "attachment": {
                "type": "template",
                "payload": {
                    "template_type": "generic",
                    "elements": [
                        {
                            "title": "Hey guys! You seem to be talking about events! Intrested in RED BULL ART OF MOTION?",
                            "image_url": "http://image.redbull.com/rbcom/010/2015-10-02/1331751440850_13/0010/1/800/450/13/redbull-art-of-motion-15-pre-event-header.jpg",
                            "buttons": [
                                {
                                    "type": "web_url",
                                    "url": "http://www.redbull.com/en/events/1331591841166/red-bull-art-of-motion",
                                    "title": "Check it out"
                                }
                            ]
                        }
                    ]
                }
            }
        }
    };
}


function createTextTemplate(clientId, text) {
    return {
        "recipient": {
            "id": clientId
        },
        "message": {
            "text": text
        }
    };
}

module.exports = {
  createTextTemplate: createTextTemplate,
  createVideoTemplate: createVideoTemplate,
  sendTemplate: sendTemplate,
  createFriendRequestTemplate: createFriendRequestTemplate,
  createEventTemplate: createEventTemplate
}
