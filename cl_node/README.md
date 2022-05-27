# Chainlink Node JOB definition

# Bridge: DecentTwitterAPI

Dont forget to fund Chainlink Node Smart contract token(eth, bnb etc).
```
Name:decenttwitterapi
URL:http://localhost:8080
```

# Twitter API job description
```
type = "directrequest"
schemaVersion = 1
name = "Twitter Likes"
externalJobID = "76718198-f53a-4e44-9a56-9964cf900073"
maxTaskDuration = "0s"
contractAddress = "<myawsomeoracle>"
minIncomingConfirmations = 0
observationSource = """
    decode_log   [type="ethabidecodelog"
                  abi="OracleRequest(bytes32 indexed specId, address requester, bytes32 requestId, uint256 payment, address callbackAddr, bytes4 callbackFunctionId, uint256 cancelExpiration, uint256 dataVersion, bytes data)"
                  data="$(jobRun.logData)"
                  topics="$(jobRun.logTopics)"]

    decode_cbor  [type="cborparse" data="$(decode_log.data)"]
    fetch        [type="bridge" name="decenttwitterapi" requestData="{\\"id\\": $(jobSpec.externalJobID), \\"data\\": { \\"tweetID\\": $(decode_cbor.tweetID) } }"]
    parse        [type="jsonparse" path="data" data="$(fetch)"]
    encode_large  [type="ethabiencode" abi="(bytes32 requestId, string[] _data)" data="{\\"requestId\\": $(decode_log.requestId), \\"_data\\": $(parse)}"]
    encode_tx    [type="ethabiencode"
                  abi="fulfillOracleRequest2(bytes32 requestId, uint256 payment, address callbackAddress, bytes4 callbackFunctionId, uint256 expiration, bytes calldata data)"
                  data="{\\"requestId\\": $(decode_log.requestId), \\"payment\\":   $(decode_log.payment), \\"callbackAddress\\": $(decode_log.callbackAddr), \\"callbackFunctionId\\": $(decode_log.callbackFunctionId), \\"expiration\\": $(decode_log.cancelExpiration), \\"data\\": $(encode_large)}"
                 ]
    submit_tx    [type="ethtx" to="<myawsomeoracle>" data="$(encode_tx)"]

    decode_log -> decode_cbor -> fetch -> parse -> encode_large -> encode_tx -> submit_tx
"""
```

# Scripts usage
```
cp .api.example .api
cp .password.example .password
cp .env.rinkeby .env
# ./fixdb.sh -> in case of postgresql errors.
# -e DEFAULT_HTTP_TIMEOUT="600s" -> dont fail External API request while waiting for VRF delivery.
# chainlink node 1.3.0 works fine.
./start.sh
```