// https://developer.twitter.com/en/docs/twitter-api/v1/accounts-and-users/follow-search-get-users/api-reference/get-followers-ids
const axios = require("axios");
console.log(require('dotenv').config({path: './.env.twitter'}));

const oAuthConfig = {
    consumer_key:         process.env.TWITTER_CONSUMER_KEY,
    consumer_secret:      process.env.TWITTER_CONSUMER_SECRET,
    access_token:         process.env.TWITTER_ACCESS_TOKEN,
    access_token_secret:  process.env.TWITTER_ACCESS_TOKEN_SECRET,
    env: process.env.TWITTER_WEBHOOK_ENV,
    port: 1337,
};

const getUser = async (userId) => {
  // user tweets
  const baseUrl = "https://api.twitter.com/2/tweets";
  const params = {
    ids: userId,
    include_entities: true,
    headers: {
      Authorization:
        "Bearer {process.env.TWITTER_BEARER_TOKEN}",
    },
  };
  const response = await axios.get(baseUrl, params);
  return response.data;
};

const getFollowerList = async (userName) => {
  const baseUrl = "https://api.twitter.com/1.1/followers/ids.json";
  const params = {
    cursor: -1,
    screen_name: userName,
    skip_status: true,
    include_user_entities: false,
  };

  const response = await axios.get(baseUrl, params);
  return response.data;
};

//array of ids
const getTweetHistoryOfIds = async (
  listOfIds,
  userData,
  updateDBWithUserInfo,
  userName,
  db
) => {
  var Twitter = require("twitter-node-client").Twitter;
  var error = function (err, response, body) {
    console.log("ERROR [%s]", err);
  };

  var config = {
    consumerKey: "",
    consumerSecret: "",
    accessToken: "-",
    accessTokenSecret: "",
  };
  var twitter = new Twitter(config);
  const response = twitter.getUserTimeline(
    { user_id: listOfIds, count: "10" },
    error,
    (res) => {
      const resp = JSON.parse(res).map((val) => {
        let str = val.text;
        str = str.replace(/(?:https?|ftp):\/\/[\n\S]+/g, "");
        return {
          tweet_id: val.id,
          tweet_text: str,
          like_count: val.favorite_count,
          retweet_count: val.retweet_count,
          created_at: val.created_at,
          is_retweeted: Boolean(val.retweeted_status),
          retweet_author: val.retweeted_status
            ? val.retweeted_status.user.screen_name
            : "original",
          entities: {
            hashtags: val.entities.hashtags,
            symbols: val.entities.symbols,
            user_mentions: val.entities.user_mentions,
            urls: val.entities.urls,
          },
        };
      });

      let output = {};
      resp.forEach((val, idx) => {
        output[idx] = val;
      });
      output.additionalInfo = userData;
      output.userCategory = null;
      output.mood = "Satisfied";
      output["happiest-tweet"] = null;
      output["saddest-tweet"] = null;

      updateDBWithUserInfo(userName, output, db);
    }
  );
  return response;
};

module.exports = {
  getFollowerList,
  getTweetHistoryOfIds,
  getUser,
};
