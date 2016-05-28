const request = require('request-promise-lite');
const token = "EAAJhSrhupzsBAGgBIAnEnhTfgSYehmwPf04FD08FKZAoms7pZCFSwLBYDp3w00GKozRu5WfOX6LNHBxIVgfOdsZBZA3B8zRMKK20Oz6jqaWZBAG3PpmXxURVv2qhruAcK6NaUYsNofaKSZBWx43Ez4ZCDoTUfFGhduPpf6cYHbyegZDZD";

function sendTemplate(sender, template) {
    const url = `https://graph.facebook.com/v2.6/me/messages?access_token=${token}`;
    const options = { json: true, body: template };

    console.log('Send template', JSON.stringify(template, null, 2));

    return request.post(url, options)
        .then(response => {
            console.log('Got message', response);
        })
        .catch(error => {
            console.warn('Error', error.message);
            console.warn(error.stack);
        });
}

function sendVideo(sender, url, thumbnail, title) {
    const template = {
        "recipient": {
            "id": sender
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

    return sendTemplate(sender, template);
}

function sendText(sender, text) {
    template = {
        "recipient": {
            "id": sender
        },
        "message": {
            "text": text
        }
    };

    return sendTemplate(sender, template);
}

module.exports = {
  sendText: sendText,
  sendVideo: sendVideo,
  sendTemplate: sendTemplate
}