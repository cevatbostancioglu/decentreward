const { ethers } = require('ethers');

const { web3 } = require('web3');

const { hashPersonalMessage, ecrecover, pubToAddress } = require('ethereumjs-util');
const { isHexString, toBuffer } = require('ethereumjs-util');

const fs = require('fs');
const { verify } = require('crypto');

require('dotenv').config({path: '../../.env'});
require('dotenv').config({path: './.env.twitter'}) // same values except "export"

const contractArtifact = JSON.parse(fs.readFileSync("../../scripts/contract.json"));
const contractAddress = JSON.parse(fs.readFileSync("../../scripts/contract-address.json"));

const provider = new ethers.providers.InfuraProvider(process.env.NETWORK_NAME, process.env.INFURA_PROJECT_ID, process.env.INFURA_PROJECT_SECRET);
const test1 = new ethers.Wallet(process.env.KOVAN_PRIVATE_KEY, provider);
const test2 = new ethers.Wallet(process.env.KOVAN_PRIVATE_KEY2, provider);

console.log("deployer(test2):", test2.address);
console.log("user(test1):", test1.address);
console.log("contract_address:", contractAddress.name);

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

function successString2(response) {
  return {
    data: response.toString(),
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
const bodyParser = require('body-parser');
const { parseEther } = require('ethers/lib/utils');
const { utils } = require('web3');
const router = express.Router();
const blockchain_contract_app = express();

blockchain_contract_app.use(bodyParser.urlencoded({extended: false}));
blockchain_contract_app.use(bodyParser.json())
let port = process.env.BACKEND_FRONTEND_PORT || 5000;

router.post("/getContestState", function(req, res) {
  console.log("getContestState -> ", req.body.tweetID);
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
  console.log("getContestRewardAmount -> ", req.body.tweetID);
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
  console.log("getRewardBalanceWithTwitterID -> ", req.body.tweetID);
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
  console.log("getRandomSeed -> ", req.body.tweetID);
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
  console.log("getProofLocation -> ", req.body.tweetID);
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

router.post("/getEtherBalanceWithAddress", function(req, res) {
  console.log("getEtherBalanceWithAddress:", req.body.address);
  _contract_owner.getEtherBalanceWithAddress(req.body.address)
  .then(state => {
    res.setHeader("Access-Control-Allow-Origin", "*")
    res.status(200).json(successString(state._hex))
  })
  .catch(error => {
    console.log("error: getEtherBalanceWithAddress");
    console.log(error);
    res.status(500).json(errorw(error))
  })
});

// twitterID -> ethAddress
router.post("/getTwitterID", function(req, res) {
  console.log("getTwitterID:", req.body.address);
  _contract_owner.getTwitterID(req.body.address)
  .then(state => {
    res.setHeader("Access-Control-Allow-Origin", "*")
    console.log("getTwitterID:" + req.body.address + " :" + state);
    res.status(200).json(successString2(state))
  })
  .catch(error => {
    console.log("error: getTwitterID");
    console.log(error);
    res.status(500).json(errorw(error))
  })
});

// twitterID -> ethAddress
router.post("/getBlockNumber", function(req, res) {
  console.log("getBlockNumber");
  provider.getBlockNumber()
  .then(state => {
    res.setHeader("Access-Control-Allow-Origin", "*")
    console.log("getBlockNumber -> " + state.data);
    res.status(200).json(successString2(state))
  })
  .catch(error => {
    console.log("error: getBlockNumber");
    console.log(error);
    res.status(500).json(errorw(error))
  })
});

// twitterID -> ethAddress
router.post("/getAddressFromTwitterID", function(req, res) {
  console.log("getAddressFromTwitterID:", req.body.address);
  _contract_owner.getAddressFromTwitterID(req.body.address)
  .then(state => {
    res.setHeader("Access-Control-Allow-Origin", "*")
    console.log("getAddressFromTwitterID:" + req.body.address + " :" + state);
    res.status(200).json(successString2(state))
  })
  .catch(error => {
    console.log("error: getAddressFromTwitterID");
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
blockchain_contract_app.listen(port, () => console.log(`Backend contract listening on port ${port}!`));

/* end of in app server */

const rewardContractAddress = contractAddress.name;

const rewardContractGetState = async (tweetID) =>
{
  console.log("rewardContractGetState -> ", tweetID)
  let state = await _contract_owner.getContestState(tweetID.toString());

  return state;
}

const rewardContractGetContestOwnerTwitterID = async(tweetID) =>
{
  console.log("rewardContractGetContestOwner -> ", tweetID)
  // contest[twitterID].contestOwner;
  let contestOwnerEth = await _contract_owner.getContestOwner(tweetID)
  // addressTwitterID[userAddress];
  let contestOwnerTwitterID = await _contract_owner.getTwitterID(contestOwnerEth.toString())
  
  return contestOwnerTwitterID;
}

const rewardContractGetContestRewardAmount = async(tweetID) =>
{
  console.log("rewardContractGetContestRewardAmount -> ", tweetID)
  // contest[tweetID].rewardAmount
  let rewardAmount = await _contract_owner.getContestRewardAmount(tweetID)

  return ethers.utils.formatEther(rewardAmount);
}

// contest winner twitter id, tweet id
const rewardContractwithdrawWinnerReward = async(tweetID, ethAddress) => {
  console.log("rewardContractwithdrawWinnerReward ->twitter" + 
      tweetID + ", ethAddress:" + ethAddress.toString()); 
  let tx = _contract_owner.withdrawWinnerReward(tweetID.toString(), ethAddress.toString())

  return tx.hash
}

const rewardContractGetWinnerTwitterID = async(tweetID) =>
{
  console.log("rewardContractGetWinnerTwitterID -> ", tweetID)
  // contest[tweetID].winnerTwitterID;
  let winnerTwitterID = await _contract_owner.getWinnerTwitterID(tweetID)
  return winnerTwitterID;
}

const rewardContractGetProofLocation = async(tweetID) =>
{
  console.log("rewardContractGetProofLocation -> ", tweetID)
  let ipfshash = await _contract_owner.getProofLocation(tweetID)
  return ipfshash;
}

const rewardContractRegister = async (ethAddress, twitterID) =>
{
  console.log("rewardContractRegister -> ", ethAddress, twitterID)
  let tx = await _contract_owner.setTwitterID(ethAddress.toString(), twitterID.toString());
  console.log(tx)
  return tx.hash;
}

const rewardContractRequestProofFromNode = async (twitterID) =>
{
  console.log("rewardContractRequestProofFromNode->", twitterID);
  
  let tx = await _contract_owner.requestProofFromNode(twitterID.toString());
  console.log(tx);

  return tx.hash;
}

const rewardContractGetEthAddress = async (twitterID) =>
{
  console.log("rewardContractGetEthAddress -> ", twitterID)
  // twitterIDAddress[twitterID]
  let ethAddress = await _contract_owner.getAddressFromTwitterID(twitterID.toString());
  return ethAddress;
}

const rewardContractBotCreateContest = async(twitterID, tweetID) =>
{
  console.log("rewardContractBotCreateContest -> " + twitterID + " -> " + tweetID);

  let contestOwner = await rewardContractGetEthAddress(twitterID.toString());
  console.log("rewardContractBotCreateContest -> ownerEth ->" + contestOwner);

  if (contestOwner == "0x0000000000000000000000000000000000000000")
  {
    console.log("owner is 0x00 ?? not registered");
    let m = "Please deposit using \n" +
    "http://localhost:3000/ \n" + 
    "https://rinkeby.etherscan.io/address/" + rewardContractAddress + "#writeContract \n";

    return m;
  }
  
  let tx = await _contract_owner.bot_createNewContest(contestOwner, tweetID.toString());
  return tx.hash;
}

const rewardDepositBalanceWithTwitterID = async(twitterID) => 
{
  console.log("rewardDepositBalanceWithTwitterID ->", twitterID);
  let ethAddress = await _contract_owner.getAddressFromTwitterID(twitterID.toString());
  console.log("ethAddress ->", ethAddress);
  let balance = await getEtherBalanceWithAddress(ethAddress.toString());
  console.log("balance->" + ethers.utils.formatEther(balance) + " Ether");
  return ethers.utils.formatEther(balance);
}

const getEtherBalanceWithAddress = async(ethAddress) => {
  console.log("getEtherBalanceWithAddress(" + ethAddress + ");");
  let check_balance = await _contract_owner.getEtherBalanceWithAddress(ethAddress.toString());
  console.log("balance=", check_balance);
  return check_balance;
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

var jSig = {
  address: "0x70b674d9220ac9022420023a8c1034ecfadc0e3b",
  msg: "0x68656c6c6f",
  sig: "075158171db1b6e5776d53e3ac45a2cb4ed853ba0255a81a4e6cfc2a49a3c35f3a24207e1ac0031fb3d5c1b17e123ede4240b35cd7f8f54461c084342e3c50211c",
  version: "3",
  signer: "MEW"
};

const getBlockNumber = async() =>
{
  let latestBlock = provider.getBlockNumber();
  return latestBlock;
}

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

const readParametersFromContract = async function(tweetID)
{
  var count = 0;
  while(true)
  {
    count++;
    let vrf_arrived = await _contract_owner.getContestState(tweetID);
    console.log("vrf state: " + vrf_arrived + " , elapsed:" + count + "s");
    if (vrf_arrived >= 3)
    {
      console.log("vrf_arrived, breaking..");
      break;
    }

    // 10 minutes
    if(count == 550)
    {
      console.log("its been 10 minutes since request arrived, we need to return something.")
      //let tx = await _contract_owner.setContestState(tweetID.toString(), 1);
      break; 
    }

    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  if(count >= 600)
  {
    // maxTwitterLikes -> 1000000000 
    return Math.random() * 1000000000;
  }
  else
  {
    let randSeed = await _contract_owner.getRandomSeed(tweetID);
    return randSeed;
  }
};

module.exports = {
    verifyMessage,
    getBlockNumber,
    readParametersFromContract,
    rewardContractAddress,
    rewardContractRegister,
    rewardDepositBalanceWithTwitterID,
    rewardContractGetState,
    rewardContractGetContestRewardAmount,
    rewardContractGetProofLocation,
    rewardContractGetWinnerTwitterID,
    rewardContractRequestProofFromNode,
    rewardContractGetContestOwnerTwitterID,
    rewardContractBotCreateContest,
    rewardContractGetEthAddress,
    rewardContractwithdrawWinnerReward
  };