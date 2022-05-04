console.log(require('dotenv').config({path: './.env.twitter'}));

module.exports = {
    consumer_key:         process.env.TWITTER_CONSUMER_KEY,
      consumer_secret:      process.env.TWITTER_CONSUMER_SECRET,
      access_token:         process.env.TWITTER_ACCESS_TOKEN,
      access_token_secret:  process.env.TWITTER_ACCESS_TOKEN_SECRET,
      env: process.env.TWITTER_WEBHOOK_ENV,
      port: 1337,
  };