// Node needs the declaration to permit usage of 'let' */
'use strict';

const messaging = require('../messaging');
const freerunning = require('../freerunning');
const Promise = require('bluebird');

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

  createInitialFlow() {
    const cid = this.profile.id;

    return Promise.resolve([
      messaging.createTextTemplate(cid, `Hi ${this.profile.first_name}! Nice to meet you! I’m Redbot, your artificial friend.`),
      messaging.createTextTemplate(cid, `Would you like to see some nice videos of freerunning?`),
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
            messaging.createVideoTemplate(cid, url, still, title),
            messaging.createTextTemplate(cid, `Did you like it?`),
            messaging.createTextTemplate(cid, `Would you like to see another video?`),
          ].reverse();
      })
      .bind(this);
  }

  createMingleLoop() {
    return Promise.resolve([
      messaging.createTextTemplate(cid, `Would you want to meet some other freerunners?`),
      messaging.createTextTemplate(cid, `Ok, I'll introduce you to ${profile2.first_name}?`),
    ].reverse());
  }

  nextState() {
    return new Promise((resolve, reject) => {
      switch(this.state) {
        case 'initial':
          // Pick a reply, until no more left in inital flow; then move to videos
          var message = this.initialFlow.pop();
          if (this.initialFlow.length === 0) {
            this.state = 'videos';
          }
          return resolve(message);

        case 'videos':
          // If there's nobody available in the room, show a video
          if (this.videoFlow.length !== 0) {
            return resolve(this.videoFlow.pop());
          }

          // Loop in videos until we have somebody in the room
          return this.createVideoFlow()
            .then((flow) => {
              this.videoFlow = flow;
              return resolve(this.videoFlow.pop());
            });

        default:
            var template = messaging.createTextTemplate(this.profile.id, `Out of options`);
            return resolve(template);
      }
    })
    .bind(this);
  }

  hear(message) {
    this.nextState()
      .then(template => this.say(template));
  }
}

module.exports = Dialog;