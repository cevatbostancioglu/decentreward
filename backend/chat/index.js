const { Autohook } = require('twitter-autohook');
const axios = require("axios");
const { config } = require("./config");
const { classifyAndAnswerDM, respondFollower } = require("./message-response");
const {
  getFollowerList,
  getTweetHistoryOfIds,
  getUser,
} = require("./follower-search");

///
const { createRequest } = require('./Resolver');

const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const port = process.env.BACKEND_CHAINLINK_NODE_PORT || 8080

app.use(bodyParser.json())

app.post('/', (req, res) => {
  console.log('POST Data: ', req.body)
  createRequest(req.body, (status, result) => {
    //console.log('Result: ', result)
    res.status(status).json(result)
  })
})

app.listen(port, () => console.log(`External API listening on port ${port}!`))
////

const lookUp = async (user, event) => {
  // Need a way to get the user's actual username rather than the screen name :/
  // We will use this method to parse through the new follower's relevant tweets
  // We will add it into our userData object and put it into our database.

  // const userData = {
  //   handle: '@Hello',
  //   screen_name: user,
  //   followers: '10',
  //   tweetList: [{
  //     tweetId: "10",
  //     tweetContent: "Hi with desktop publions of Lorem Ipsum. ",
  //     likes: '2',
  //     retweets: "3",
  //     comments: "4",
  //     creation: "date/time",
  //     tweetOwner: "@Hello",
  //     owner: "true"
  //   }],
  // }

  console.log(event.follow_events[0].source);

  console.log("user data:", event.follow_events[0].source);
  const userName = event.follow_events[0].source.screen_name;
  const userId = event.follow_events[0].source.id;
  const userData = event.follow_events[0].source;

  //getTweetHistoryOfIds(userId, userData, updateDBWithUserInfo, userName, db);
};

const onEvent = (webhook) => {
  webhook.on("event", async (event) => {
    if (event.follow_events) {
      let user = event.follow_events[0].source.name;
      lookUp(user, event); // we call this method in order to parse through that user's tweets.
      // one api call here
      await respondFollower(event);
    }

    if (event.direct_message_events) {
        await classifyAndAnswerDM(event);
    }
  });
};

(async start => {
  try {
    const webhook = new Autohook(config);
    // Removes existing webhooks
    await webhook.removeWebhooks();
    
    // Listens to incoming activity
    await onEvent(webhook);

    // Starts a server and adds a new webhook
    await webhook.start();
    
    // Subscribes to your own user's activity
    await webhook.subscribe({
      oauth_token: process.env.TWITTER_ACCESS_TOKEN, 
      oauth_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
    });
  } catch (e) {
    // Display the error and quit
    console.error(e);
    process.exit(1);
  }
})();  