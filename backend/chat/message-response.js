const axios = require("axios");
const Twit = require('twit');
const { TwitterApi }  = require('twitter-api-v2');
const util = require("util");
const request = require("request");
const post = util.promisify(request.post);

const { saveDatabase, returnUserState } = require('./user-state');

const { ethers } = require('ethers');

const { verifyMessage, 
    signMessage, 
    readBalanceWithTwitterID, 
    readAddressDepositAmount,
    pairAddressTwitterID,
    updateCheckRewardTwit,
    signContestStart,
    isEthAddressVerified } = require('./blockchain');

require('dotenv').config({path: './.env.twitter'});

const oAuthConfig = {
    consumer_key:         process.env.TWITTER_CONSUMER_KEY,
    consumer_secret:      process.env.TWITTER_CONSUMER_SECRET,
    token:         process.env.TWITTER_ACCESS_TOKEN,
    token_secret:  process.env.TWITTER_ACCESS_TOKEN_SECRET
};

const twitterClient = new TwitterApi(process.env.TWITTER_BEARER_TOKEN);

var T = new Twit({
  consumer_key:         process.env.TWITTER_CONSUMER_KEY,
  consumer_secret:      process.env.TWITTER_CONSUMER_SECRET,
  access_token:         process.env.TWITTER_ACCESS_TOKEN,
  access_token_secret:  process.env.TWITTER_ACCESS_TOKEN_SECRET,
  timeout_ms:           60*1000,  // optional HTTP request timeout to apply to all requests.
})

const helpText = "\n                           \
- help - Help menu                             \
- flow - Reward                                \
- reward Reward status, use it with tweet id   \
         reward 12345                          \
        --- started will be done x.y.z         \
        --- winner:                            \
        --- candicates:                        \
        good luck next time!                   \
- verify signature verification                \
- status my status on rewards                  \
- start tweetid                                \
- stop tweedid                                 \
- cancel tweedid                               \
";

async function markAsRead(messageId, senderId, auth) {
    const requestConfig = {
      url: 'https://api.twitter.com/1.1/direct_messages/mark_read.json',
      form: {
        last_read_event_id: messageId,
        recipient_id: senderId,
      },
      oauth: auth,
    };
  
    await post(requestConfig);
}

async function indicateTyping(senderId, auth) {
    const requestConfig = {
      url: 'https://api.twitter.com/1.1/direct_messages/indicate_typing.json',
      form: {
        recipient_id: senderId,
      },
      oauth: auth,
    };
  
    await post(requestConfig);
}

const replyTweet = async (userScreenName, tweetID, textMessage) => {
  //await twitterClient.v1.reply("@" + userScreenName + " " + textMessage, tweetID);
  
  T.post('statuses/update', {status: "@" + userScreenName + " " + textMessage, in_reply_to_status_id: tweetID }, 
    function (err, data, response) {
      console.log("sent reply tweet.");
  });
  //replyTweet("GodModeInvestor", "1523825807243812865", "hello");
};

const tweetLikedBy = async function(id) {
  console.log("tweetLikedBy:", id);
  const users = await twitterClient.v2.tweetLikedBy(id, { asPaginator: true });
  var allIDs = [];
  for await(const user of users) 
  {
    allIDs.push(user);
  }
  //uniq = allIDs;//[...new Set(allIDs)]; // remove duplicates
  //console.log(allIDs);
  
  console.log("tweetLikedBy done, length:", allIDs.length);

  return allIDs;
  //tweetLikedBy("1523825807243812865");
  //tweetLikedBy("1525266410012016641");
}


const replyDMMessage = async (message, textMessage) => {
    const requestConfig = {
        url: "https://api.twitter.com/1.1/direct_messages/events/new.json",
        oauth: oAuthConfig,
        json: {
          event: {
            type: "message_create",
            message_create: {
              target: {
                recipient_id: message.message_create.sender_id,
              },
              message_data: {
                text: textMessage,
              },
            },
          },
        },
      };
    
      const response = await post(requestConfig);
      console.log("replyDMMessage done");
}

const classifyAndAnswerDM = async (event) => {
  // This is broken
  // We check that the message is a direct message
  if (!event.direct_message_events) {
    return;
  }

  // Messages are wrapped in an array, so we'll extract the first element
  const message = event.direct_message_events.shift();

  // We check that the message is valid
  if (
    typeof message === "undefined" ||
    typeof message.message_create === "undefined"
  ) {
    return;
  }

  // We filter out message you send, to avoid an infinite loop
  if (
    message.message_create.sender_id ===
    message.message_create.target.recipient_id
  ) {
    return;
  }

  // Prepare and send the message reply
  const senderScreenName = event.users[message.message_create.sender_id].name;
  const senderID = message.message_create.sender_id;
  const userName = event.users[message.message_create.sender_id].screen_name;

  saveDatabase(message.message_create.sender_id, message.message_create.message_data.text);

  let textMessage = `Hi @${senderScreenName}! 👋🏻`;
  console.log(message.message_create.message_data.text);
  message_itself = message.message_create.message_data.text;
  message_toLowerCase = message.message_create.message_data.text.toLowerCase();

  if (message_toLowerCase.includes("hello, how are you?")) {
    textMessage = helpText;
  }
  else if (message_toLowerCase.includes("verify"))
  {
    textMessage = "Please sign latest eth blocknumber with your address key." +
     "latest block: https://etherscan.io/blocks, sign using myEtherWallet(https://www.myetherwallet.com/wallet/sign)," +
     " and copy the result here."
  }
  else if (message_toLowerCase.includes("signer") && message_toLowerCase.includes("mew"))
  {
      textJson = JSON.parse(message_toLowerCase);
      if (verifyMessage(textJson).verified == true) {
        balance = pairAddressTwitterID(verifyMessage(textJson).signer, senderID, userName);
        textMessage = "Verified, signer(0x" + verifyMessage(textJson).signer + ") belongs to " + senderScreenName + "(" + 
        senderID + "), balance on contract:" + balance + " wei";
        console.log(textMessage);
      }
      else
      {
        textMessage = "Failed to verify on bot, please only copy given text";
      }
  }
  else if (message_toLowerCase.includes("start:"))
  {
    console.log(message_toLowerCase);
    let tweetID = message_itself.substr(6);

    if (isEthAddressVerified(senderID))
    {
      updateCheckRewardTwit(tweetID, senderID);
      textMessage = signContestStart(tweetID);
      replyTweet(userName, tweetID, textMessage);
    }
    else
    {
      textMessage = "Eth Verification failed, please type verify for more instructions.";
    }
  }
  else {
    textMessage = helpText
  }

  replyDMMessage(message, textMessage);
};

const respondFollower = async (event) => {
  // This is broken
  // We check that the message is a direct message

  //console.log("Bruh Moment", event.follow_events[0].source.id);
  // Messages are wrapped in an array, so we'll extract the first element
  const message = event.follow_events.type;

  // Prepare and send the message reply
  const senderScreenName = event.follow_events[0].source.name;
  const userName = event.follow_events[0].source.screen_name;

  console.log(event.follow_events[0].source);
  let textMessage = `Hi @${senderScreenName}! 👋 \n We have specially curated #HowAreYouTweening2020 for you! Thank you for being with us for the year, and we're excited to have many more years ahead! \n Check out what you've been up to: \n https://how-are-you-tweeting.netlify.app/?username=${userName}`;
  let requestConfig = {
    url: "https://api.twitter.com/1.1/direct_messages/events/new.json",
    oauth: oAuthConfig,
    json: {
      event: {
        type: "message_create",
        message_create: {
          target: {
            recipient_id: event.follow_events[0].source.id,
          },
          message_data: {
            text: textMessage,
          },
        },
      },
    },
  };

  let response = await post(requestConfig);
  textMessage =
    "We know that this has been a tough year! :( We are here to support! \n Reply one of the following to ... \n 1. Get Motivated \n 2. Meet meaningful people \n";

  requestConfig = {
    url: "https://api.twitter.com/1.1/direct_messages/events/new.json",
    oauth: oAuthConfig,
    json: {
      event: {
        type: "message_create",
        message_create: {
          target: {
            recipient_id: event.follow_events[0].source.id,
          },
          message_data: {
            text: textMessage,
          },
        },
      },
    },
  };
  response = await post(requestConfig);
};

module.exports = {
    classifyAndAnswerDM,
  respondFollower,
  tweetLikedBy,
};
