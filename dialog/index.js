// Node needs the declaration to permit usage of 'let' */
'use strict';

const Promise = require('bluebird');
const messaging = require('../messaging');
const freerunning = require('../freerunning');
const groups = require('../groupmessage');

class Dialog {
  constructor(profile, story) {
    this.profile = profile;
    this.story = story;
    this.state = 'initial';
  }

  init() {
    return Promise.props({
      initialFlow: this.createInitialFlow(),
      videoFlow: this.createVideoFlow()
    })
    .bind(this)
    .then(props => {
      this.initialFlow = props.initialFlow;
      this.videoFlow = props.videoFlow;
      return this;
    });
  }

  // External interface
  say(messageTemplate) {
    return messaging.sendTemplate(messageTemplate)
    .catch(error => console.log(error.stack))
  }

  sayWithDelay(delay, messageTemplate) {
    return this.say(messageTemplate)
      .delay(delay);
  }

  createInitialFlow() {
    const cid = this.profile.id;

    return Promise.resolve([
      [
        messaging.createTextTemplate(cid, `Hi ${this.profile.first_name}! Nice to meet you! I’m Redbot, your artificial friend.`),
        messaging.createTextTemplate(cid, `Would you like to see some nice videos of freerunning?`)
      ]
    ].reverse());
  }

  createVideoFlow() {
    return freerunning.getRandomFreerunningStory()
      .then(story => {
        const cid = this.profile.id;
        const url = `https://bothack.eu-gb.mybluemix.net/video.html?storyid=${story.id}`;
        const still = story.videos[0].stillimage;
        const title = story.videos[0].title;

        return [
            [
              messaging.createVideoTemplate(cid, url, still, title),
              messaging.createTextTemplate(cid, `Did you like it?`)
            ]
          ].reverse();
      })
      .bind(this);
  }

  createMinglingFlow() {
    const cid = this.profile.id;

    return Promise.resolve([
      messaging.createTextTemplate(cid, `Would you want to meet some other freerunners?`),
    ].reverse());
  }

  nextState() {
    return new Promise((resolve, reject) => {
      switch(this.state) {
        case 'initial':
          console.log('In initial flow');
          // Pick a reply, until no more left in inital flow; then move to videos
          if (this.initialFlow.length === 0) {
            this.state = 'videos';

            return resolve(this.nextState());
          }

          return resolve(this.initialFlow.pop());

        case 'videos':
          console.log('In videos flow');
          // Run through video flow at least once
          if (this.videoFlow.length !== 0) {
            return resolve(this.videoFlow.pop());
          }

          // Then see if there's people to chat with
          if (groups.isPeopleForRoom()) {
            this.state = 'mingling';

            this.createMinglingFlow()
              .bind(this)
              .then(flow => {
                this.minglingFlow = flow;
                return resolve(this.nextState());
              });
          }

          // Loop in videos until we have somebody in the room
          return this.createVideoFlow()
            .then(flow => {
              this.videoFlow = flow;

              // Create transition back to videos
              var template = messaging.createTextTemplate(this.profile.id, `Would you like to see another video?`);
              return resolve(template);
            });

        case 'mingling':
          console.log('In mingling flow');
          // Run through mingling flow at least once
          if (this.minglingFlow.length !== 0) {
            return resolve(this.minglingFlow.pop());
          }

          // Create a room
          groups.startRoom();
          var template = messaging.createTextTemplate(this.profile.id, `Ok, I'll introduce you to somebody!`);
          return resolve(template);
          break;

        default:
            var template = messaging.createTextTemplate(this.profile.id, `Out of options`);
            return resolve(template);
      }
    })
    .bind(this);
  }

  hear(message) {
    this.nextState()
      .then(templateOrArray => {

        // Case array
        if (Array.isArray(templateOrArray)) {
          return Promise.mapSeries(templateOrArray, this.sayWithDelay.bind(this, 3000));
        }

        // Case plain template
        return this.say(templateOrArray);
      });
  }
}

module.exports = Dialog;