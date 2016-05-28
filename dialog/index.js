// Node needs the declaration to permit usage of 'let' */
'use strict';

const EventEmitter = require('events');
const Wit = require('node-wit').Wit;
const uuid = require('uuid');
const messaging = require('../messaging');

const appId = '5749becd-9e9a-470d-9aa2-af4a771e4c3b';
const serverToken = 'SAJI5UOESYEUV7JUQ2WQLHFW4V66FD5T';
const clientToken = 'M62YAPHQLXW6IY6ETL5CZHUHZAIOQIVP';

class Dialog {
  constructor(clientId) {
    var _this = this;

    const actions = {
      say(sessionId, context, message, cb) {
        _this.hear(message);
        cb();
      },

      merge(sessionId, context, entities, message, cb) {
        this.context = context;

        cb(context);
      },

      error(sessionId, context, error) {
        console.log(error.message);
      },
    };

    this.context = {};
    this.sessionId = uuid.v1();
    this.clientId = clientId;
    this.wit = new Wit(serverToken, actions);
  }

  // External interface
  say(message) {
    return new Promise((resolve, reject) => {

      this.wit.runActions(
        this.sessionId,
        message,
        this.context, (error, context) => {
          if (error) {
            console.log('Oops! Got an error from Wit:', error);
            return reject(error);
          }

          console.log('Wit action run', context);

          return resolve(context);
        }
      )
    });
  }

  hear(message) {
    // Send the Wit response back to FB client
    return messaging.sendText(this.clientId, message)
      .catch(error => {
        console.warn(error.message);
        console.warn(error.stack);
      })
  }
}

module.exports = Dialog;