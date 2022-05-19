//SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "../chainlink/contracts/src/v0.8/ChainlinkClient.sol";

/**
 * Request testnet LINK and ETH here: https://faucets.chain.link/
 * Find information on LINK Token Contracts and get the latest ETH and LINK faucets here: https://docs.chain.link/docs/link-token-contracts/
 */

/**
 * @notice DO NOT USE THIS CODE IN PRODUCTION. This is an example contract.
 */
contract ApiConsumer is ChainlinkClient {
  using Chainlink for Chainlink.Request;

  // variable bytes returned in a signle oracle response
  string[] public data;
  bytes32 public specId = "76718198f53a4e449a569964cf900073";
  uint256 public payment = 100000000000000000;

  constructor(address _link, address _oracle)
  {
    setChainlinkToken(_link);
    setChainlinkOracle(_oracle);
  }

  /**
   * @notice Request variable bytes from the oracle
   */
  function requestBytes(string memory tweetID)
    public
  {
    require(bytes(tweetID).length > 0);
    Chainlink.Request memory req = buildChainlinkRequest(specId, address(this), this.fulfillBytes.selector);
    req.add("tweetID", tweetID);
    sendOperatorRequest(req, payment);
  }

  event RequestFulfilled(
    bytes32 indexed requestId,
    string[] indexed data
  );

  /**
   * @notice Fulfillment function for variable bytes
   * @dev This is called by the oracle. recordChainlinkFulfillment must be used.
   */
  function fulfillBytes(
    bytes32 requestId,
    string[] memory _data
  )
    public
    recordChainlinkFulfillment(requestId)
  {
    emit RequestFulfilled(requestId, _data);
    data = _data;
  }

}