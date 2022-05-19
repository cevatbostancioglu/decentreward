const { Requester, Validator } = require('@chainlink/external-adapter')
const { tweetLikedBy } = require('./message-response');

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
  const jobRunID = input.id
  const tweetID = input.data.tweetID;
  
  // The Requester allows API calls be retry in case of timeout
  // or connection failure
  tweetLikedBy(tweetID)
    .then(response => {
      // It's common practice to store the desired value at the top-level
      // result key. This allows different adapters to be compatible with
      // one another.
      //response.data.result = Requester.validateResultNumber(response.data, [tsyms])
      //console.log("response:", response);
      callback(200, success(jobRunID, response));
    })
    .catch(error => {
      console.log("error");
      console.log(error);
      callback(500, "Requester.errored(jobRunID, error)");
    })
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
