const { ethers } = require('ethers');

const { web3 } = require('web3');

const { hashPersonalMessage, ecrecover, pubToAddress } = require('ethereumjs-util');
const { isHexString, toBuffer } = require('ethereumjs-util');

const fs = require('fs');
const { verify } = require('crypto');

require('dotenv').config({path: '/home/cevat/.chainlink-kovan/decentreward/.env'});
require('dotenv').config({path: './.env.twitter'})

const contractArtifact = JSON.parse(fs.readFileSync("/home/cevat/.chainlink-kovan/decentreward/scripts/contract.json"));
const contractAddress = JSON.parse(fs.readFileSync("/home/cevat/.chainlink-kovan/decentreward/scripts/contract-address.json"));

const provider = new ethers.providers.InfuraProvider(process.env.NETWORK_NAME, process.env.INFURA_PROJECT_ID, process.env.INFURA_PROJECT_SECRET);
const test1 = new ethers.Wallet(process.env.KOVAN_PRIVATE_KEY, provider);
const test2 = new ethers.Wallet(process.env.KOVAN_PRIVATE_KEY2, provider);

console.log("deployer(test2):", test2.address);
console.log("user(test1):", test1.address);
console.log("contract_address:", contractAddress.name);

// Then, we initialize the contract using that provider and the token's
// artifact. You can do this same thing with your contracts.
_contract_owner = new ethers.Contract(
    contractAddress.name,
    contractArtifact.abi,
    test2
);
_contract_user = new ethers.Contract(
  contractAddress.name,
  contractArtifact.abi,
  test1
);

/* in app server */
function success(response) {
  return {
    data: response,
    statusCode: 200,
  }
}

function successNumber(response) {
  return {
    data: ethers.utils.formatEther(response),
    statusCode: 200,
  }
}

function successString(response) {
  return {
    data: ethers.utils.formatEther(response).toString(),
    statusCode: 200,
  }
}

function errorw(response) {
  return {
    data: response,
    statusCode: 500,
  }
}

const express = require("express");
const bodyParser = require('body-parser')
const router = express.Router();
const blockchain_contract_app = express();

blockchain_contract_app.use(bodyParser.urlencoded({extended: false}));
blockchain_contract_app.use(bodyParser.json())
let port = 5000;


router.post("/getContestState", function(req, res) {
  _contract_owner.getContestState(req.body.tweetID)
  .then(state => {
    console.log("success:getContestState:", req.body.tweetID);
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(200).json(success(state))
  })
  .catch(error => {
    console.log("error: getContestState");
    res.status(500).json(errorw(error))
  })
});

router.post("/getContestRewardAmount", function(req, res) {
  _contract_owner.getContestRewardAmount(req.body.tweetID)
  .then(state => {
    res.setHeader("Access-Control-Allow-Origin", "*")
    res.status(200).json(success(state))
  })
  .catch(error => {
    console.log("error: getContestRewardAmount");
    res.status(500).json(errorw(error))
  })
});

router.post("/getRewardBalanceWithTwitterID", function(req, res) {
  _contract_owner.getRewardBalanceWithTwitterID(req.body.tweetID)
  .then(state => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(200).json(success(state))
  })
  .catch(error => {
    console.log("error: getRewardBalanceWithTwitterID");
    res.status(500).json(errorw(error))
  })
});

router.post("/getRandomSeed", function(req, res) {
  _contract_owner.getRandomSeed(req.body.tweetID)
  .then(state => {
    res.setHeader("Access-Control-Allow-Origin", "*")
    res.status(200).json(success(state))
  })
  .catch(error => {
    console.log("error: getRandomSeed");
    res.status(500).json(errorw(error))
  })
});

router.post("/getProofLocation", function(req, res) {
  _contract_owner.getProofLocation(req.body.tweetID)
  .then(state => {
    res.setHeader("Access-Control-Allow-Origin", "*")
    res.status(200).json(success(state))
  })
  .catch(error => {
    console.log("error: getProofLocation");
    res.status(500).json(errorw(error))
  })
});

router.post("/getEtherBalanceWithAdress", function(req, res) {
  console.log("getEtherBalanceWithAdress:", req.body.address);
  _contract_owner.getEtherBalanceWithAdress(req.body.address)
  .then(state => {
    res.setHeader("Access-Control-Allow-Origin", "*")
    res.status(200).json(successString(state._hex))
  })
  .catch(error => {
    console.log("error: getEtherBalanceWithAdress");
    console.log(error);
    res.status(500).json(errorw(error))
  })
});

router.post("/getWinnerTwitterID", function(req, res) {
  _contract_owner.getWinnerTwitterID(req.body.tweetID)
  .then(state => {
    res.setHeader("Access-Control-Allow-Origin", "*")
    res.status(200).json(success(state))
  })
  .catch(error => {
    console.log("error: getWinnerTwitterID");
    res.status(500).json(errorw(error))
  })
});

blockchain_contract_app.use("/", router);
blockchain_contract_app.listen(port, () => console.log(`On-Chain contract listening on port ${port}!`));

/* end of in app server */

const getEtherBalanceWithAdress = async(ethAddress) => {
  console.log("getEtherBalanceWithAdress(" + ethAddress + ");");
  return 0.01;
  //let check_balance = await _contract_owner.getEtherBalanceWithAdress(ethAddress.toString());
  //console.log("balance=", check_balance);
  //return check_balance;
}

const ErrorList = {
    SIGN_FAILED: 'Failed to sign message',
    INVALID_LENGTH: 'Invalid signature length',
    FAILED_TO_VERIFY: 'Failed to verify signature'
}

const toBuffer2 = v => {
  if (isHexString(v)) {
    return toBuffer(v);
  }
  return Buffer.from(v);
};

////
const botOwner = new ethers.Wallet(process.env.KOVAN_PRIVATE_KEY);

////
class db {
    constructor(ethAddress, twitterID, screenName, contestID, verification, balance) {
      this.ethAddress = ethAddress;
      this.twitterID = twitterID;
      this.userScreenName = screenName;
      this.contestID = contestID;
      this.verification = verification;
      this.balance = balance;
    }
};

const addressDatabase = {};

var jSig = {
  address: "0x70b674d9220ac9022420023a8c1034ecfadc0e3b",
  msg: "0x68656c6c6f",
  sig: "075158171db1b6e5776d53e3ac45a2cb4ed853ba0255a81a4e6cfc2a49a3c35f3a24207e1ac0031fb3d5c1b17e123ede4240b35cd7f8f54461c084342e3c50211c",
  version: "3",
  signer: "MEW"
};

function verifyMessage(message) {
  try
  {
        let hash = hashPersonalMessage(toBuffer2(message.msg));
        const sig = Buffer.from(message.sig.replace('0x', ''), 'hex');
        if (sig.length !== 65) {
          return "ErrorList.INVALID_LENGTH";
        }
        sig[64] = sig[64] === 0 || sig[64] === 1 ? sig[64] + 27 : sig[64];
        
        if (message.version === '1') {
          hash = web3.utils.sha3(message.msg);
        }
        const pubKey = ecrecover(
          hash,
          sig[64],
          sig.slice(0, 32),
          sig.slice(32, 64)
        );
        return {
          verified:
            !message.address.replace('0x', '').toLowerCase() !==
            pubToAddress(pubKey).toString('hex').toLowerCase(),
          signer: pubToAddress(pubKey).toString('hex').toLowerCase()
        };
      }
      catch (e)
      {
        throw "ErrorList.FAILED_TO_VERIFY"
      }
};

function signMessage(message) {
    let _sig = botOwner.signMessage(message);
      return JSON.stringify(
        {
              address: botOwner.address,
              msg: message,
              sig: _sig,
              version: '3',
              signer: 'MEW'
        }
    );
};

function pairAddressTwitterID(ethAddress, twitterID, screenName) {
  balance = getEtherBalanceWithAdress("0x" + ethAddress);
  if (true) {
    console.log("balance:" + balance)

    const ldb = new db("0x" + ethAddress, twitterID, screenName, 0, true, 0.01);

    addressDatabase[twitterID] = ldb;
  }
  
  return balance;
}

function isEthAddressVerified(twitterID) {
  console.log(addressDatabase);
  if (twitterID in addressDatabase) {
    return addressDatabase[twitterID].verification
  }

  return false;
}

function updateCheckRewardTwit(twit, twitterID)
{
  // create cron 1 week.
  // deliver likes.
  // trigger
  // depositor -> addressDatabase[twitterID]
  // find content etc.
  addressDatabase[twitterID].contestID = twit;
  console.log("contestID: ", twit);
  console.log("id: ", twitterID);
  console.log("ethAddress: ", addressDatabase[twitterID].ethAddress);
}

function signContestStart(tweetID)
{
  //signMessage
  return "ID=" + tweetID + " has been started, contest will end in 1 hour.";
}

const readParametersFromContract = async function(tweetID)
{
  while(true)
  {
    let vrf_arrived = await _contract_owner.getContestState(tweetID);
    console.log("vrf state: ", vrf_arrived);

    if (vrf_arrived >= 3)
    {
      console.log("vrf_arrived, breaking..");
      break;
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  let randSeed = await _contract_owner.getRandomSeed(tweetID);
  return randSeed;
};

function readAddressDepositAmount(ethAddress)
{

}

function readBalanceWithTwitterID(twitterID)
{
  return 0;
}

  //console.log(botOwner.address);
  //console.log(botOwner.signMessage("hello"));
  //let ssss = signMessage("hello");
  //console.log(ssss);
  /*console.log(verifyMessage(jSig));
  if (verifyMessage(jSig).verified == true)
  {
    console.log("true");
  }*/
  //let ssss = signContestStart("https://t.co/ivHRig6e3E");
  //console.log(ssss);

module.exports = {
    verifyMessage,
    signMessage,
    readBalanceWithTwitterID,
    readAddressDepositAmount,
    pairAddressTwitterID,
    updateCheckRewardTwit,
    signContestStart,
    isEthAddressVerified,
    readParametersFromContract
  };