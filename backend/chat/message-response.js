const axios = require("axios");
const Twit = require('twit');
const { TwitterApi }  = require('twitter-api-v2');
const util = require("util");
const request = require("request");
const post = util.promisify(request.post);

const { saveDatabase, returnUserState } = require('./user-state');

const { ethers } = require('ethers');

const { verifyMessage, 
    getBlockNumber,
    rewardContractGetState, rewardDepositBalanceWithTwitterID,
    rewardContractAddress, rewardContractRegister,
    rewardContractBotCreateContest,
    rewardContractGetContestRewardAmount,
    rewardContractGetEthAddress, rewardContractwithdrawWinnerReward,
    rewardContractGetProofLocation, rewardContractGetWinnerTwitterID,
    rewardContractRequestProofFromNode, 
    rewardContractGetContestOwnerTwitterID } = require('./blockchain');

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
- deposit                                      \
- register <ethereum address>                  \
- balance                                      \
- create  <tweetID>                            \
- status <tweetID>                             \
- finish <tweetID>                             \
- withdraw <tweetID>                           \
- cancel tweedid                               \
";

async function markAsRead(messageId, senderID, auth) {
    const requestConfig = {
      url: 'https://api.twitter.com/1.1/direct_messages/mark_read.json',
      form: {
        last_read_event_id: messageId,
        recipient_id: senderID,
      },
      oauth: auth,
    };
  
    await post(requestConfig);
}

async function indicateTyping(senderID, auth) {
    const requestConfig = {
      url: 'https://api.twitter.com/1.1/direct_messages/indicate_typing.json',
      form: {
        recipient_id: senderID,
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

const userLookUpFromID = async(twitterID) => {
  //https://github.com/PLhery/node-twitter-api-v2/blob/53b0daf4b34fe158e12bd20038981938cc092085/doc/v2.md#UsersbyID
  const username = await twitterClient.v2.users([twitterID]);
  /*
  {
    data: [
      {
        id: '308399201',
        name: 'God Mode Investor',
        username: 'GodModeInvestor'
      }
    ]
  }*/
  return username;
}

const tweetLikedBy = async function(id) {
  console.log("tweetLikedBy:", id);
  const users = await twitterClient.v2.tweetLikedBy(id, { asPaginator: true });
  var allIDs = [];
  for await(const user of users) 
  {
    allIDs.push(user);
  }
  //uniq = allIDs;//[...new Set(allIDs)]; // remove duplicates
  
  console.log("tweetLikedBy done, length:", allIDs.length);

  return allIDs;
  //tweetLikedBy("1523825807243812865");
  //tweetLikedBy("1525266410012016641");
}

function hex_to_ascii(str1)
 {
	var hex  = str1.toString();
	var str = '';
	for (var n = 0; n < hex.length; n += 2) {
		str += String.fromCharCode(parseInt(hex.substr(n, 2), 16));
	}
	return str;
}

const replyDMMessage = async (message, textMessage) => {
    // We filter out message you send, to avoid an infinite loop
    if (
      message.message_create.sender_id ===
      message.message_create.target.recipient_id
    ) {
      return;
    }

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

const replyDMEvent = async (_event, textMessage) => {
  let requestConfig = {
    url: "https://api.twitter.com/1.1/direct_messages/events/new.json",
    oauth: oAuthConfig,
    json: {
      event: {
        type: "message_create",
        message_create: {
          target: {
            recipient_id: _event.follow_events[0].source.id,
          },
          message_data: {
            text: textMessage,
          },
        },
      },
    },
  };
  let response = await post(requestConfig);
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

  // Prepare and send the message reply
  const senderScreenName = event.users[message.message_create.sender_id].name;
  const senderID = message.message_create.sender_id;
  const userName = event.users[message.message_create.sender_id].screen_name;

  saveDatabase(message.message_create.sender_id, message.message_create.message_data.text);

  let textMessage = "Hi @" + userName + "! 👋🏻";
  console.log(message.message_create.message_data.text);
  message_itself = message.message_create.message_data.text;
  message_toLowerCase = message.message_create.message_data.text.toLowerCase();

  let messagecommands = message_toLowerCase.split(" ");

  if (message_toLowerCase.includes("hello, how are you?")) {
    textMessage = helpText;
  }
  
  if(message_toLowerCase == "balance")
  {
    console.log("balance->" + message.message_create.sender_id);
     
    let balance = await rewardDepositBalanceWithTwitterID(message.message_create.sender_id)
    textMessage = "Your usable balance on blockchain is " + balance.toString() + " Ether";
  }
  else if (message_toLowerCase == "deposit")
  {
    textMessage = "Please deposit using our website or etherscan \n" +
    "http://localhost:3000/ \n" + 
    "https://rinkeby.etherscan.io/address/" + rewardContractAddress + "#writeContract \n";
  }
  else if (message_toLowerCase.includes("address") && message_toLowerCase.includes("msg")
    && message_toLowerCase.includes("sig")
    && message_toLowerCase.includes("signer") && message_toLowerCase.includes("version"))
    {
      console.log("verifyMessage");
        textJson = JSON.parse(message_toLowerCase);

        if (verifyMessage(textJson).verified == true) {
          let decodedBlockNumber = hex_to_ascii(textJson.msg).split("-")[1];
          let latestBlockNumber = await getBlockNumber();
          
          // on rinkeby network , 100 block is almost 25minutes.
          if(decodedBlockNumber >= latestBlockNumber - 100)
          {
            //balance = pairAddressTwitterID(verifyMessage(textJson).signer, senderID, userName);
            textMessage = "Verified, signer(" + textJson.address.toString() + ") belongs to @" + userName;
            replyDMMessage(message, textMessage);
            textMessage = "Message queried to blockchain, you will get tx info soon";
            let txHash = await rewardContractRegister(textJson.address.toString(), message.message_create.sender_id)
            replyDMMessage(message, "https://rinkeby.etherscan.io/tx/" + txHash);
          }
          else
          {
            textMessage = "cannot verify, timeout(latestBlock=" +
              latestBlockNumber + ", SignedBlock=" +
              decodedBlockNumber + "), 100block = 25 minutes.\n";
          }
        }
        else
        {
          textMessage = "Failed to verify on bot, please only copy given text";
        }
    }
  else if (messagecommands.length > 1)
  {
    console.log(messagecommands[0] +"->" + message.message_create.sender_id + " -> " + messagecommands[1]);
    if(messagecommands[0] == "register12331231231213231555")
    {
      textMessage = "Message queried to blockchain, you will get tx info soon";
      let txHash = await rewardContractRegister(messagecommands[1], message.message_create.sender_id)
      let m = "https://rinkeby.etherscan.io/tx/" + txHash
      replyDMMessage(message, m);
    }
    else if(messagecommands[0] == "create")
    {
      if (messagecommands[1].toString().includes("https://t.co/"))
      {
        textMessage = "Twitter automatically use shorter urls for DM, please just send Tweet ID. \n";
      }
      else
      {
        let balance = await rewardDepositBalanceWithTwitterID(message.message_create.sender_id);

        // balance check not working for now. @todo
        if (balance > 0.01)
        {
          textMessage = "Your balance is not enough for contest, please deposit using \n" +
          "http://localhost:3000/ \n" + 
          "https://rinkeby.etherscan.io/address/" + rewardContractAddress + "#writeContract \n";
        }
        else
        {
          textMessage = "Message queried to blockchain, you will get tx info soon";
          let txHash = await rewardContractBotCreateContest(message.message_create.sender_id, 
              messagecommands[1]);
          let m = "https://rinkeby.etherscan.io/tx/" + txHash
          replyDMMessage(message, m);
        }
      }
    }
    else if(messagecommands[0] == "status")
    {
      if (messagecommands[1].toString().includes("https://t.co/"))
      {
        textMessage = "Twitter automatically use shorter urls for DM, please just send Tweet ID. \n";
      }
      else
      {
        textMessage = "Contest Status: \n";
        let localstatus = await rewardContractGetState(messagecommands[1]);
        let rewardAmount = 0;
        let ipfshash = "";
        let winnerTwitterID = "";
        let winnerUserName = "";

        if (localstatus != 0)
        {
          rewardAmount = await rewardContractGetContestRewardAmount(messagecommands[1])
        }

        if (localstatus >= 4)
        {
          ipfshash = await rewardContractGetProofLocation(messagecommands[1])
        }

        if (localstatus >= 4)
        {
          winnerTwitterID = await rewardContractGetWinnerTwitterID(messagecommands[1])
          let winnerJSON = await userLookUpFromID(winnerTwitterID);
          console.log(winnerJSON)
          winnerUserName = winnerJSON.data[0].username
          /*
          {
            data: [
              {
                id: '308399201',
                name: 'God Mode Investor',
                username: 'GodModeInvestor'
              }
            ]
          }
          */
        }

        textMessage += (localstatus == 0 ? "Contest not created for this tweet.\n" : "");
        textMessage += (localstatus == 1 ? "Contest created with " + rewardAmount + " ether\n" : localstatus >= 1 ? "Contest reward " + rewardAmount + " ether\n" : "");
        textMessage += (localstatus == 2 ? "Proof and Random Requested\n" : "")
        textMessage += (localstatus >= 3 ? "Random Delivered\n" : "")
        textMessage += (localstatus >= 4 ? "IPFS Proof Delivered\n" : "");
        textMessage += (localstatus >= 4 ? "Proof link: https://" + ipfshash + ".ipfs.dweb.link \n" : "");
        textMessage += (localstatus >= 4 ? "Winner selected, Winner:@" + winnerUserName + ", winner can withdraw reward\n" : "");
        textMessage += (localstatus >= 5 ? "Contest finished, Winner:@" + winnerUserName + ", rewards distrobuted \n" : "");
      }
    }
    else if(messagecommands[0] == "finish")
    {
      if (messagecommands[1].toString().includes("https://t.co/"))
      {
        textMessage = "Twitter automatically use shorter urls for DM, please just send Tweet ID. \n";
      }
      else
      { 
        // auth.
        let contestOwnerTwitterID = await rewardContractGetContestOwnerTwitterID(messagecommands[1]);
        
        console.log("auth:contestOwnerTwitterID -> ", contestOwnerTwitterID);

        if (contestOwnerTwitterID.toString() != message.message_create.sender_id.toString())
        {
          console.log("Auth failed.");
          textMessage = "Only creator of contest can finish contests.\n";
        }
        else
        {
          console.log("auth done. sending tx");
          textMessage = "Message queried to blockchain, you will get tx info soon";
          let txHash = await rewardContractRequestProofFromNode(messagecommands[1]);
          let m = "https://rinkeby.etherscan.io/tx/" + txHash
          replyDMMessage(message, m);
        }
      }
    }
    else if(messagecommands[0] == "withdraw")
    {
      // withdraw 123123
      if (messagecommands[1].toString().includes("https://t.co/"))
      {
        textMessage = "Twitter automatically use shorter urls for DM, please just send Tweet ID. \n";
      }
      else
      {
        let localstatus = await rewardContractGetState(messagecommands[1]);
        
        // 4-> proof delivered, 5 -> reward distro done.
        if (localstatus <4)
        {
          textMessage = (localstatus == 0 ? "Contest not available on-chain\n" : "Contest is not ready to withdraw yet.\n");
        }
        else if(localstatus == 6)
        {
          textMessage = "Contest already paid to winner\n";
        }
        else
        {
          // auth.
          let winnerTwitterID = await rewardContractGetWinnerTwitterID(messagecommands[1])
          
          console.log("auth:winnerTwitterID -> ", winnerTwitterID);

          if (winnerTwitterID.toString() != message.message_create.sender_id.toString())
          {
            console.log("Auth failed.");
            textMessage = "Only winner can withdraw rewards.\n";
          }
          else
          {
            console.log("auth done.");
            
            let winnerEthAddress = await rewardContractGetEthAddress(message.message_create.sender_id);
            
            if (winnerEthAddress == "0x0000000000000000000000000000000000000000")
            {
              textMessage = "Your Ethereum address is empty, please use register function like: \n" +
              "register <yourEthAddress> \n";
            }
            else
            {
              textMessage = "Message queried to blockchain, you will get tx info soon";
              let txHash = await rewardContractwithdrawWinnerReward(message.message_create.sender_id, 
                  messagecommands[1]);
              let m = "https://rinkeby.etherscan.io/tx/" + txHash
              replyDMMessage(message, m);
            }
          }
        }
      }
    }
    else if (messagecommands[0] == "verify")
    {
      textMessage = "Please sign latest eth blocknumber with your address key." +
      "latest block number: https://etherscan.io/blocks, sign using myEtherWallet(https://www.myetherwallet.com/wallet/sign)," +
      " and copy the result here."
    }
    /*
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
    */
    else {
      textMessage = helpText
    }
  }
  else
  {
    textMessage = helpText
  }

  replyDMMessage(message, textMessage);
};

const respondFollower = async (event) => {
  const message = event.follow_events.type;

  // Prepare and send the message reply
  const senderScreenName = event.follow_events[0].source.name;
  const userName = event.follow_events[0].source.screen_name;

  //console.log(event.follow_events[0].source);
  let textMessage = "Hi @" + userName +"! 👋 \n, You can use this DM for managing your contests.";
  
  await replyDMEvent(event, textMessage)

  textMessage = helpText;

  await replyDMEvent(event, textMessage)
};

module.exports = {
    classifyAndAnswerDM,
  respondFollower,
  tweetLikedBy,
};
