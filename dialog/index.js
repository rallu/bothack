// Node needs the declaration to permit usage of 'let' */
'use strict';

const messaging = require('../messaging');

class Dialog {
  constructor(profile) {
    this.profile = profile;
    this.clientId = profile.id;

    this.messages = [
      `Hi ${profile.first_name}! Nice to meet you! I’m Redbot, your artificial friend.`,
      `Would you like to see some nice videos of freerunning?`,
      `Ok, here is a video for you!`
    ].reverse();

    console.log(this.messages);
  }

  // External interface
  say(message) {
    console.log('Say', message, 'to', this.profile.id);
    messaging.sendText(this.profile.id, message);
  }

  hear(message) {
    console.log('Hear', message);
    var reply = this.messages.pop();
    console.log('reply', JSON.stringify(reply));
    this.say(reply);
  }
}

module.exports = Dialog;