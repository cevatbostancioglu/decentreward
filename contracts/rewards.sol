pragma solidity ^0.8.7;
// SPDX-License-Identifier: MIT

import "../openzeppelin-contracts/contracts/access/Ownable.sol";
import "../openzeppelin-contracts/contracts/utils/math/SafeMath.sol";
import "../openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";

// VRF
import "../chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "../chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "../chainlink/contracts/src/v0.8/ChainlinkClient.sol";

//import "../chainlink/contracts/src/v0.8/KeeperCompatible.sol";

contract DRewards is Ownable, ChainlinkClient, VRFConsumerBaseV2 {
	uint8 public feeRatePercentage = 5;

	/* Safe Math */
	using SafeMath for uint256;
	/* End of Safe Math */

	using Chainlink for Chainlink.Request;

	// data delivery
	bytes32 public specId = "76718198f53a4e449a569964cf900073";
	uint256 public payment = 100000000000000000;

	//VRF

	bool public fakeVRF = false;

	VRFCoordinatorV2Interface COORDINATOR;
	
	// Your subscription ID.
	uint64 s_subscriptionId;
	// Rinkeby coordinator. For other networks,
	// see https://docs.chain.link/docs/vrf-contracts/#configurations
	address vrfCoordinator = 0x6168499c0cFfCaCD319c818142124B7A15E857ab;
	// The gas lane to use, which specifies the maximum gas price to bump to.
	// For a list of available gas lanes on each network,
	// see https://docs.chain.link/docs/vrf-contracts/#configurations
	bytes32 keyHash = 0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc;
	// Depends on the number of requested values that you want sent to the
	// fulfillRandomWords() function. Storing each word costs about 20,000 gas,
	// so 100,000 is a safe default for this example contract. Test and adjust
	// this limit based on the network that you select, the size of the request,
	// and the processing of the callback request in the fulfillRandomWords()
	// function.
	uint32 public callbackGasLimit = 200000;
	// The default is 3, but you can set this higher.
	uint16 requestConfirmations = 3;

	// contest
	uint256 maxTwitterLikes = 1000000000; // 1e9

  	enum EContestState
   	{
		CONTEST_EMPTY, /* 0 */
	   	CONTEST_CREATED, /* 1 CONTEST ID, REWARDS, CONTEST OWNER */
	   	CONTEST_RANDOM_AND_PROOF_REQUESTED, /* 2 RANDOM REQUEST */
	   	CONTEST_RANDOM_DELIVERED, /* 3 RANDOM DELIVERED */
	   	CONTEST_PROOF_DELIVERED, /* 4 PROOF DELIVERED */
		CONTEST_WINNER_LOTTERY_DONE, /* 5 ETH DEPOSIT TO TWITTER WINNER ID */
	   	CONTEST_END /* 6 */
   	}

   	// rewards
   	struct DReward {
		/* contest info */
		address contestOwner; 			/* eth address */
	  	uint256 rewardAmount; 			/* in eth for now*/

		/* contest variables and proof */
		uint256 randomSeed;   			/* random seed from vrf/keccak */
	  	EContestState contestState; 	/* state of contest */
		string  winnerTwitterID;     	/* winner Twitter ID */
		string  ipfsLocation;        	/* ipfs Location */
   	}
	
	// TweetID for indexing and tracking
	mapping(string => DReward) contest;

	// vrf requestID -> contest ID
   	mapping(uint256 => string) contestVRFRequestIDTable;

	// winnerTwitterID 
	mapping(string => uint256) winnerEthAmount;

   	// userAddress => eth amount
   	mapping(address => uint256) userEthDeposits; 

   	// userAddress <=> twitterID
   	mapping(address => string) addressTwitterID;
   	mapping(string => address) twitterIDAddress;

	// constructor
   	constructor(address _link, address _oracle, uint64 subscriptionId) 
	   	VRFConsumerBaseV2(vrfCoordinator)
   	{
		COORDINATOR = VRFCoordinatorV2Interface(vrfCoordinator);
		s_subscriptionId = subscriptionId;
		setChainlinkToken(_link);
		setChainlinkOracle(_oracle);
	}

   	/*constructor(uint64 subscriptionId) VRFConsumerBaseV2(vrfCoordinator) {
	  	COORDINATOR = VRFCoordinatorV2Interface(vrfCoordinator);
	  	s_subscriptionId = subscriptionId;
   	}*/

	event updateContestState(string indexed tweetID, EContestState indexed state);

	// create new contest
  	function u_createNewContest(string memory tweetID) 
		public 
		onlyEmptyContest(tweetID)
	{
		require(userEthDeposits[msg.sender] > 0, 
			"Your must deposit eth.");
	  	
		require(bytes(tweetID).length > 0);

	  	contest[tweetID].contestOwner = msg.sender;
		contest[tweetID].rewardAmount = contest[tweetID].rewardAmount.add(userEthDeposits[msg.sender]);
	  	userEthDeposits[msg.sender] = 0;
	  	contest[tweetID].contestState = EContestState.CONTEST_CREATED;

	  	emit updateContestState(tweetID, contest[tweetID].contestState);
   	}

   	function bot_createNewContest(address contestOwner, string memory tweetID) 
		public 
		onlyOwner
		onlyEmptyContest(tweetID)
	{
	  	require(userEthDeposits[contestOwner] > 0, 
			"Your reward amount must be greater then you already deposit.");

	  	require(bytes(tweetID).length > 0);
	  
	  	contest[tweetID].contestOwner = contestOwner;
	  	contest[tweetID].rewardAmount = contest[tweetID].rewardAmount.add(userEthDeposits[msg.sender]);
		userEthDeposits[msg.sender] = 0;
		contest[tweetID].contestState = EContestState.CONTEST_CREATED;

		emit updateContestState(tweetID, contest[tweetID].contestState);
   	}

	// trigger reward distro
   	function triggerRewardDistrobution(string memory tweetID)
		private
		onlyOwnerContestOwnerOrWinner(tweetID)
	  	onlyValidContest(tweetID)
	  	onlyContestState(tweetID, EContestState.CONTEST_PROOF_DELIVERED)
			returns(bool)
   	{
		// only user or owner.
		contest[tweetID].contestState = EContestState.CONTEST_WINNER_LOTTERY_DONE;
		
		string memory _contestWinner = contest[tweetID].winnerTwitterID;
		
		// no one liked the tweet, refund back without fee.
		if(compareStrings(_contestWinner, "0") == true)
		{
			address contestOwner = contest[tweetID].contestOwner;
			userEthDeposits[contestOwner] = userEthDeposits[contestOwner].add(contest[tweetID].rewardAmount);
			emit updateContestState(tweetID, contest[tweetID].contestState);
			return false;
		}
		else
		{
			//feeRatePercentage
			uint256 feeResult = contest[tweetID].rewardAmount.mul(feeRatePercentage);
			feeResult = feeResult.div(100);
			userEthDeposits[owner()] = userEthDeposits[owner()].add(feeResult);
			contest[tweetID].rewardAmount = contest[tweetID].rewardAmount.sub(feeResult);
			winnerEthAmount[_contestWinner] = winnerEthAmount[_contestWinner].add(contest[tweetID].rewardAmount);
			return true;
		}
   	}

	// eth reward deposit
   	event ethDepositComplete(address user, uint256 amount);
	function depositEther() public payable returns(uint256)
	{
		userEthDeposits[msg.sender] = userEthDeposits[msg.sender].add(msg.value);
	  	emit ethDepositComplete(msg.sender, msg.value);
	  	return userEthDeposits[msg.sender];
	}

	function withdrawContractOwnerFund(address payable fundManager)
		public
		onlyOwner
	{
		require(userEthDeposits[owner()] > 0);
		fundManager.transfer(userEthDeposits[owner()]);
		userEthDeposits[owner()] = 0;
	}

	// withdraw reward
	function withdrawWinnerReward(string memory tweetID, address payable contestWinner)
		public
		onlyOwnerContestOwnerOrWinner(tweetID)
		onlyValidContest(tweetID)
	{
		bool r = triggerRewardDistrobution(tweetID);
		
		require(contest[tweetID].contestState == EContestState.CONTEST_WINNER_LOTTERY_DONE);

		contest[tweetID].contestState = EContestState.CONTEST_END;
		
		// if reward distributed or refunded to deposit account of owner.
		if(r)
		{
			string memory _winnerTwitterID = contest[tweetID].winnerTwitterID;
			
			//TODO: issue here. contest owner can send funds to whoever they want.
			// if(twitterIDAddress[_winnerTwitterID] == address(0))
			contestWinner.transfer(winnerEthAmount[_winnerTwitterID]);
			winnerEthAmount[_winnerTwitterID] = 0;
		}

		emit updateContestState(tweetID, contest[tweetID].contestState);
	}

	/*
	* @notice Request variable bytes from the oracle
	* @TODO: double request issue. onlyContestStateGE -> onlyContestState
	*/
	function requestProofFromNode(string memory tweetID)
		public
		onlyOwnerOrContestOwner(tweetID)
	  	onlyContestState(tweetID, EContestState.CONTEST_CREATED)
   	{
		// only owner or user itself.
		Chainlink.Request memory req = buildChainlinkRequest(specId, address(this), this.fulfillBytes.selector);
		req.add("tweetID", tweetID);

		/*bytes32 reqID = */ /* test reqID uniqueness */
		sendOperatorRequest(req, payment);

		contest[tweetID].contestState = EContestState.CONTEST_RANDOM_AND_PROOF_REQUESTED;
		
		/* false by default. */
		if ( fakeVRF == true)
		{	
			contest[tweetID].randomSeed = uint256(keccak256(abi.encodePacked(block.timestamp,block.difficulty, msg.sender))) % maxTwitterLikes;
			contest[tweetID].contestState = EContestState.CONTEST_RANDOM_DELIVERED; // on-chain.
		}
		else
		{
			requestRandomSeed(tweetID);
		}

		emit updateContestState(tweetID, contest[tweetID].contestState);
   	}   

   	// VRF and External API
   	// Assumes the subscription is funded sufficiently.
   	function requestRandomSeed(string memory tweetID)
		public
		onlyOwnerOrContestOwner(tweetID)
		onlyContestState(tweetID, EContestState.CONTEST_RANDOM_AND_PROOF_REQUESTED)
	{
		/* false by default. */
		if ( fakeVRF == true)
		{
			contest[tweetID].randomSeed = uint256(keccak256(abi.encodePacked(block.timestamp,
											block.difficulty, msg.sender))) % maxTwitterLikes;

			contest[tweetID].contestState = EContestState.CONTEST_RANDOM_AND_PROOF_REQUESTED;
			contest[tweetID].contestState = EContestState.CONTEST_RANDOM_DELIVERED; // on-chain.
		}
		else
		{
			// VRF
			// Will revert if subscription is not set and funded.
			uint256 s_requestId = COORDINATOR.requestRandomWords(
				keyHash,
				s_subscriptionId,
				requestConfirmations,
				callbackGasLimit,
				1
			);
			contestVRFRequestIDTable[s_requestId] = tweetID;
			//contest[tweetID].contestState = EContestState.CONTEST_RANDOM_AND_PROOF_REQUESTED;
		}

		emit updateContestState(tweetID, contest[tweetID].contestState);
   	}

	event RequestRandomFulfilled(
		uint256 indexed requestID,
		uint256[] indexed randomWords
	);

   	function fulfillRandomWords(
		uint256 requestID, /* requestId */
		uint256[] memory randomWords
   	) internal override
   	{
		/* override */
		string memory tweetID = contestVRFRequestIDTable[requestID];
		/* is % still makes it random ? */
		contest[tweetID].randomSeed = randomWords[0] % maxTwitterLikes;
		contest[tweetID].contestState = EContestState.CONTEST_RANDOM_DELIVERED;

		emit RequestRandomFulfilled(requestID, randomWords);
		emit updateContestState(tweetID, contest[tweetID].contestState);
   	}

	function compareStrings(string memory a, string memory b) public pure returns (bool) {
    	return (keccak256(abi.encodePacked((a))) == keccak256(abi.encodePacked((b))));
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
		string memory tweetID = _data[0];
		contest[tweetID].winnerTwitterID = _data[1];
		contest[tweetID].ipfsLocation = _data[2];
		contest[tweetID].contestState = EContestState.CONTEST_PROOF_DELIVERED;
		
		emit RequestFulfilled(requestId, _data);
		emit updateContestState(tweetID, contest[tweetID].contestState);
   	}


	// set functions

	function setContestState(string memory tweetID, EContestState state)
		public
		onlyOwner
	{
		require(bytes(tweetID).length > 0);
		contest[tweetID].contestState = state;
	}

	function setTwitterID(address userAddress, string memory twitterID)
   		public
   		onlyOwner
   	{
		require(bytes(twitterID).length > 0);
		addressTwitterID[userAddress] = twitterID;
		twitterIDAddress[twitterID] = userAddress;
   	}

	function setCallBackGasLimit(uint32 _new)
		public
		onlyOwner
	{
		callbackGasLimit = _new;
	}

	function setFakeVRF(bool _new)
		public
		onlyOwner
	{
		fakeVRF = _new;
	}

	function setFeeRate(uint8 _newRatePercentage)
		public
		onlyOwner
	{
		feeRatePercentage = _newRatePercentage;
	}

	// get functions

	function getContractOwnerFund()
		public
		view
		returns(uint256)
	{
		return userEthDeposits[owner()];
	}

	function getContestOwner(string memory twitterID)
		public
		view
		returns(address)
	{
		return contest[twitterID].contestOwner;
	}

	function getEtherBalanceWithAddress(address user) 
		public 
		view 
		returns(uint256)
   	{
		return userEthDeposits[user];
   	}

	function getFakeVRF()
		public
		view
		returns(bool)
	{
		return fakeVRF;
	}

	function getRewardBalanceWithTwitterID(string memory twitterID)
		public
		view
		returns(uint256)
	{
		return winnerEthAmount[twitterID];
	}
	
	function getContestIDFromVRFRequest(uint256 requestID) 
		public
		view
		returns(string memory)
	{
		require(bytes(contestVRFRequestIDTable[requestID]).length > 0);
		return contestVRFRequestIDTable[requestID];
	}

   	function getRandomSeed(string memory tweetID) 
		public 
		view 
		returns(uint256)
   	{
		return contest[tweetID].randomSeed;
   	}

   	function getContestState(string memory tweetID)
		public
		view
		returns(EContestState)
   	{
		return contest[tweetID].contestState;
   	}

	function getTwitterID(address userAddress) 
		public 
		view 
		returns(string memory)
   	{
		return addressTwitterID[userAddress];
   	}

   	function getAddressFromTwitterID(string memory twitterID) 
	   	public 
		view 
		returns(address)
   	{
		return twitterIDAddress[twitterID];
   	}

   	function getProofLocation(string memory tweetID) 
		public 
	  	view 
	  	returns(string memory)
   	{
		return contest[tweetID].ipfsLocation;
   	}
   
   	function getWinnerTwitterID(string memory tweetID)
		public
		view
		returns(string memory)
	{
	  	return contest[tweetID].winnerTwitterID;
	}

	function getContestRewardAmount(string memory tweetID)
		public
		view
		returns(uint256)
	{
		return contest[tweetID].rewardAmount;
	}

	// modifiers

	modifier onlyOwnerOrContestOwner(string memory tweetID) {
		require(contest[tweetID].contestOwner == msg.sender || 
			owner() == msg.sender, "only contest owner or owner can trigger");
		_;
	}

	modifier onlyOwnerContestOwnerOrWinner(string memory tweetID) {
		require((contest[tweetID].contestOwner == msg.sender) || 
			(owner() == msg.sender) || 
			(compareStrings(addressTwitterID[msg.sender], contest[tweetID].winnerTwitterID) == true), "only contest owner or owner can trigger");
		_;
	}

   	modifier onlyEmptyContest(string memory newContestID) {
		require(bytes(newContestID).length > 0);
		require(contest[newContestID].contestOwner == address(0));
		_;
   	}

	// greater than
	modifier onlyContestStateGT(string memory tweetID, EContestState state) {
		require(bytes(tweetID).length > 0);
		require(contest[tweetID].contestState > state);
		_;
	}

	// greater than or equal to
	modifier onlyContestStateGE(string memory tweetID, EContestState state) {
		require(bytes(tweetID).length > 0);
		require(contest[tweetID].contestState >= state);
		_;
	}

	// equal to
   	modifier onlyContestState(string memory tweetID, EContestState state) {
		require(bytes(tweetID).length > 0);
		require(contest[tweetID].contestState == state);
		_;
   	}

	// less than or equal to
	modifier onlyContestStateLE(string memory tweetID, EContestState state) {
		require(bytes(tweetID).length > 0);
		require(contest[tweetID].contestState < state);
		_;
   	}   

	// less than 
   	modifier onlyContestStateLT(string memory tweetID, EContestState state) {
		require(bytes(tweetID).length > 0);
		require(contest[tweetID].contestState < state);
		_;
   	}
	
   	modifier onlyValidContest(string memory tweetID) {
		require(bytes(tweetID).length > 0);
		require(contest[tweetID].contestOwner != address(0));
	  	require(contest[tweetID].rewardAmount != 0);
	  	_;
   	}
}