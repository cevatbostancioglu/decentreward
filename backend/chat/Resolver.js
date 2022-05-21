const { Requester, Validator } = require('@chainlink/external-adapter')
const { tweetLikedBy } = require('./message-response');
const { readParametersFromContract } = require('./blockchain')
const { ipfsUpload } = require('./ipfs-put-files');

// Define custom error scenarios for the API.
// Return true for the adapter to retry.
const customError = (data) => {
  if (data.Response === 'Error') return true
  return false
}

// Define custom parameters to be used by the adapter.
// Extra parameters can be stated in the extra object,
// with a Boolean value indicating whether or not they
// should be required.
const customParams = {
  tweet: ['tweet', 'tweedid', 'thread'],
  endpoint: false
}

function success(jobRunID = '1', response) {
    return {
      jobRunID,
      data: response,
      result: null,
      statusCode: 200,
    }
}

const createRequest = (input, callback) => {
  console.log(input);
  // The Validator helps you validate the Chainlink request data
  //const validator = new Validator(callback, input, customParams)
  const jobRunID = input.id;
  const contestID = input.data.contestID;

  readParametersFromContract(contestID)
  .then(result => {
    input.data["randSeed"] = result.randSeed;
    input.data["tweetID"] = result.tweetID;
    tweetLikedBy(result.tweetID)
    .then(tweetliked => {
        ipfsUpload(input, tweetliked, callback)
          .then(response => {
            callback(200, success(jobRunID, response));
          })
          .catch(error => {
            console.log("error");
            console.log(error);
            callback(500, "ipfsUpload error");
          });
    })
    .catch(error => {
      console.log("error");
      console.log(error);
      callback(500, "tweetApi error");
    });
  })
  .catch(error => {
    console.log("error");
    console.log(error);
    callback(500, "ethereum read error");
  });
}

// This is a wrapper to allow the function to work with
// GCP Functions
exports.gcpservice = (req, res) => {
  createRequest(req.body, (statusCode, data) => {
    res.status(statusCode).send(data)
  })
}

// This is a wrapper to allow the function to work with
// AWS Lambda
exports.handler = (event, context, callback) => {
  createRequest(event, (statusCode, data) => {
    callback(null, data)
  })
}

// This is a wrapper to allow the function to work with
// newer AWS Lambda implementations
exports.handlerv2 = (event, context, callback) => {
  createRequest(JSON.parse(event.body), (statusCode, data) => {
    callback(null, {
      statusCode: statusCode,
      body: JSON.stringify(data),
      isBase64Encoded: false
    })
  })
}

// This allows the function to be exported for testing
// or for running in express
module.exports.createRequest = createRequest
