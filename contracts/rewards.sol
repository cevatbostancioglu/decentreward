pragma solidity ^0.8.7;
// SPDX-License-Identifier: MIT

// @godmodeinvestor => 0x70B674D9220aC9022420023A8C1034EcfaDc0E3B -> 308399201
// @decentrewardbot => 0x06b911ACca1000823054D9f17424198b076faF86 -> 1518535984320851968

import "../openzeppelin-contracts/contracts/access/Ownable.sol";
import "../openzeppelin-contracts/contracts/utils/math/SafeMath.sol";
import "../openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";

//import "./IDPairing.sol";
// VRF
import "../chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "../chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "../chainlink/contracts/src/v0.8/ChainlinkClient.sol";

//import "./ApiConsumer.sol";

//import "../chainlink/contracts/src/v0.8/KeeperCompatible.sol";


contract DRewards is Ownable, ChainlinkClient {
	/* Safe Math */
	using SafeMath for uint256;
	/* End of Safe Math */

	using Chainlink for Chainlink.Request;

	// data delivery
	bytes32 public specId = "76718198f53a4e449a569964cf900073";
	uint256 public payment = 100000000000000000;

	//inherit VRFConsumerBaseV2
	//VRFCoordinatorV2Interface COORDINATOR;
	address public linkTokenAddress;

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
	uint32 callbackGasLimit = 100000;
	// The default is 3, but you can set this higher.
	uint16 requestConfirmations = 3;

	// contest
	uint256 public latestContestID = 1;

	uint256 maxTwitterLikes = 1000000000; // 1e9

  	enum EContestState
   	{
		CONTEST_EMPTY,
	   	CONTEST_CREATED, /* CONTEST ID, REWARDS, CONTEST OWNER */
	   	CONTEST_RANDOM_REQUESTED, /* RANDOM REQUEST */
	   	CONTEST_RANDOM_GENERATED, /* RANDOM GENERATED */
	   	CONTEST_PROOF_REQUESTED, /* PROOF requested*/
	   	CONTEST_PROOF_DELIVERED, /* PROOF delivered */
		CONTEST_WINNER_LOTTERY_DONE, /* ETH DEPOSIT TO TWITTER WINNER ID */
	   	CONTEST_REWARDS_DISTRIBUTED, /* REWARDS DISTRIBUTED */
	   	CONTEST_END
   	}

   	// rewards
   	struct DReward {
		uint256 contestID;    			/* ID for indexing */
	  	
		/* contest info */
		address contestOwner; 			/* eth address */
	  	uint256 rewardAmount; 			/* in eth for now*/
		string  tweetID;      			/* tweet id for contest */

		/* contest variables and proof */
		uint256 randomSeed;   			/* random seed from vrf/keccak */
	  	EContestState contestState; 	/* state of contest */
		string  winnerTwitterID;     	/* winner Twitter ID */
		string  ipfsLocation;        	/* ipfs Location */
   	}
	
	mapping(uint256 => DReward) contest;

	// vrf requestID -> contest ID
   	mapping(uint256 => uint256) contestVRFRequestIDTable;
	// data requestID -> contest ID 	
   	mapping(bytes32 => uint256) dataRequestTable;

	// userAddress => tokenAddress => token amount
   	mapping(address => mapping (address => uint256)) userDeposits;

	// winnerTwitterID 
	mapping(string => uint256) winnerEthAmount;

   	// userAdress => eth amount
   	mapping(address => uint256) userEthDeposits; 

   	// userAddress <=> twitterID
   	mapping(address => string) addressTwitterID;
   	mapping(string => address) twitterIDAdress;

	// constructor
   	constructor(address _link, address _oracle)
   	{
		linkTokenAddress = _link;
		setChainlinkToken(_link);
		setChainlinkOracle(_oracle);
	}

   	/*constructor(uint64 subscriptionId) VRFConsumerBaseV2(vrfCoordinator) {
	  	COORDINATOR = VRFCoordinatorV2Interface(vrfCoordinator);
	  	s_subscriptionId = subscriptionId;
   	}*/

	event updateContestState(uint256 contestID, EContestState state);

	// create new contest
  	function u_createNewContest(uint256 rewardAmount, string memory tweetID) 
		public 
		onlyEmptyContest(latestContestID) 
		returns(uint256)
	{
		require(rewardAmount > 0);
	  	/*require(userDeposits[msg.sender][linkTokenAddress] <= rewardAmount, 
				"Your reward amount must be greater then you already deposit.");
	  	*/
	  	require(userEthDeposits[msg.sender] <= rewardAmount, 
				"Your reward amount must be greater then you already deposit.");
	  	
		require(bytes(tweetID).length > 0);

	  	contest[latestContestID].contestOwner = msg.sender;
	  	contest[latestContestID].contestID = latestContestID;
	  	contest[latestContestID].tweetID = tweetID;
	  	userEthDeposits[msg.sender] = userEthDeposits[msg.sender].sub(rewardAmount);
	  	contest[latestContestID].rewardAmount = contest[latestContestID].rewardAmount.add(rewardAmount);
	  	contest[latestContestID].contestState = EContestState.CONTEST_CREATED;
	  	//userDeposits[msg.sender][linkTokenAddress] = userDeposits[msg.sender][linkTokenAddress].sub(rewardAmount);
		
	  	emit updateContestState(latestContestID, contest[latestContestID].contestState);
	  
	  	latestContestID = latestContestID.add(1);

	  	return (latestContestID - 1);
   	}

   	function bot_createNewContest(address contestOwner, uint256 rewardAmount, string memory tweetID) 
		public 
		onlyOwner
		onlyEmptyContest(latestContestID)
		returns(uint256)
	{
		require(rewardAmount > 0);
	  	require(userEthDeposits[contestOwner] <= rewardAmount, 
			"Your reward amount must be greater then you already deposit.");

	  	require(bytes(tweetID).length > 0);
	  
	  	contest[latestContestID].contestOwner = contestOwner;
	  	contest[latestContestID].contestID = latestContestID;
		contest[latestContestID].tweetID = tweetID;
		userEthDeposits[msg.sender] = userEthDeposits[msg.sender].sub(rewardAmount);
	  	contest[latestContestID].rewardAmount = contest[latestContestID].rewardAmount.add(rewardAmount);
		contest[latestContestID].contestState = EContestState.CONTEST_CREATED;
	  	//userDeposits[msg.sender][linkTokenAddress] = userDeposits[msg.sender][linkTokenAddress].sub(rewardAmount);

		emit updateContestState(latestContestID, contest[latestContestID].contestState);

		latestContestID = latestContestID.add(1);

		return (latestContestID - 1);
   	}

	// trigger reward distro
   	function triggerRewardDistrobution(uint256 contestID)
		public
	  	onlyValidContest(contestID)
	  	onlyContestState(contestID, EContestState.CONTEST_PROOF_DELIVERED)
   	{
		// only user or owner.
		contest[contestID].contestState = EContestState.CONTEST_WINNER_LOTTERY_DONE;
		
		string memory _contestWinner = contest[contestID].winnerTwitterID;
		winnerEthAmount[_contestWinner] = winnerEthAmount[_contestWinner].add(contest[contestID].rewardAmount);

		emit updateContestState(contestID, contest[contestID].contestState);
   	}

	// eth reward deposit
   	event ethDepositComplete(address user, uint256 amount);
	function depositEther() public payable returns(uint256)
	{
		userEthDeposits[msg.sender] = userEthDeposits[msg.sender].add(msg.value);
	  	emit ethDepositComplete(msg.sender, msg.value);
	  	return userEthDeposits[msg.sender];
	}

	// ERC20 all
	event tokenDepositComplete(address tokenAddress, uint256 amount);
	
   	/* erc20 deposit disabled */
	/*function approveToken(uint256 amount) public onlyOwner
	{

	}*/

	/* erc20 deposit disabled */
	function depositToken(uint256 amount) public onlyOwner
	{
		require(IERC20(linkTokenAddress).balanceOf(msg.sender) >= amount, 
			"Your token amount must be greater then you are trying to deposit");

		require(IERC20(linkTokenAddress).approve(address(this), amount));
		require(IERC20(linkTokenAddress).transferFrom(msg.sender, address(this), amount));

		userDeposits[msg.sender][linkTokenAddress] += amount;
		emit tokenDepositComplete(linkTokenAddress, amount);
	}

	// withdraw reward
	function withdrawWinnerReward(uint256 contestID, address payable contestWinner)
		public
		onlyOwner
		onlyValidContest(contestID)
		onlyContestState(contestID, EContestState.CONTEST_WINNER_LOTTERY_DONE)
	{
		/*require(IERC20(linkTokenAddress).transfer(contestWinner, contest[contestID].rewardAmount), 
			"transfer failed.");
		*/
		contest[contestID].contestState = EContestState.CONTEST_END;
		string memory _winnerTwitterID = contest[contestID].winnerTwitterID;
		contestWinner.transfer(winnerEthAmount[_winnerTwitterID]);
		winnerEthAmount[_winnerTwitterID] = 0;
		emit updateContestState(contestID, contest[contestID].contestState);
	}

	/**
	* @notice Request variable bytes from the oracle
	*/
	function requestProofFromNode(uint256 contestID)
		public
		onlyOwner
	  	onlyContestState(contestID, EContestState.CONTEST_RANDOM_GENERATED)
   	{
		// only owner or user itself.
		Chainlink.Request memory req = buildChainlinkRequest(specId, address(this), this.fulfillBytes.selector);
		req.addUint("contestID", contestID);

		bytes32 reqID = sendOperatorRequest(req, payment);

		dataRequestTable[reqID] = contestID;
		contest[contestID].contestState = EContestState.CONTEST_PROOF_REQUESTED;
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
	  	uint256 contestID = getContestIDFromDataRequest(requestId);

		/*
		require(contestID > 0);
		require(contest[contestID].rewardAmount > 0);
		require(candidatesIDs.length > 0);
		public onlyOwner
			onlyContestState(contestID, EContestState.CONTEST_CREATED)
		*/
		contest[contestID].winnerTwitterID = _data[0];
		contest[contestID].ipfsLocation = _data[1];
		contest[contestID].contestState = EContestState.CONTEST_PROOF_DELIVERED;
		
		triggerRewardDistrobution(contestID);

		emit updateContestState(contestID, contest[contestID].contestState);
   	}

   	// VRF
   	// Assumes the subscription is funded sufficiently.
   	function requestRandomSeed(uint256 contestID) 
		external 
		onlyValidContest(contestID) 
		onlyOwner
		onlyContestState(contestID, EContestState.CONTEST_CREATED)
	{ 
	  	contest[contestID].randomSeed = uint256(keccak256(abi.encodePacked(block.timestamp,block.difficulty, msg.sender))) % maxTwitterLikes;
		contest[contestID].contestState = EContestState.CONTEST_RANDOM_REQUESTED; /* vrf is not available now. */
		contest[contestID].contestState = EContestState.CONTEST_RANDOM_GENERATED;
		
		requestProofFromNode(contestID);
		
		emit updateContestState(contestID, contest[contestID].contestState);
		/* VRF have problems.
		// Will revert if subscription is not set and funded.
		contest[contestID].vrfRequestID = COORDINATOR.requestRandomWords(
			keyHash,
			s_subscriptionId,
			requestConfirmations,
			callbackGasLimit,
			1
		);
		contestVRFRequestIDTable[contest[contestID].vrfRequestID] = contestID;
		*/
   	}

   	function fulfillRandomWords(
		uint256 requestID, /* requestId */
		uint256[] memory randomWords
   	) internal  
   	{
		/* override */
		uint256 contestID = getContestIDFromVRFRequest(requestID);
		contest[contestID].randomSeed = randomWords[0];
		contest[contestID].contestState = EContestState.CONTEST_RANDOM_GENERATED;
		emit updateContestState(contestID, contest[contestID].contestState);
   	}

	function setTwitterID(address userAddress, string memory twitterID)
   		public
   		onlyOwner
   	{
		require(bytes(twitterID).length > 0);
		addressTwitterID[userAddress] = twitterID;
		twitterIDAdress[twitterID] = userAddress;
   	}

	function getEtherBalanceWithAdress(address user) 
		public 
		view 
		returns(uint256)
   	{
		return userEthDeposits[user];
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
		returns(uint256)
	{
		require(contestVRFRequestIDTable[requestID] != 0);
		return contestVRFRequestIDTable[requestID];
	}

	function getContestIDFromDataRequest(bytes32 requestID)
		public
		view
		returns(uint256)
	{
		require(dataRequestTable[requestID] != 0);
		return dataRequestTable[requestID];
	}

   	function getContestTwitterID(uint256 contestID)
		public
		view
		onlyValidContest(contestID) 
		returns(string memory)
   	{
	  	return contest[contestID].tweetID;
   	}

   	function getRandomSeed(uint256 contestID) 
		public 
		view 
		onlyValidContest(contestID) 
		returns(uint256)
   	{
		require(contest[contestID].contestState >= EContestState.CONTEST_RANDOM_GENERATED);
		return contest[contestID].randomSeed;
   	}

   	function getContestState(uint256 contestID)
		public
		view
		onlyValidContest(contestID)
		returns(EContestState)
   	{
		return contest[contestID].contestState;
   	}

	function getTwitterID(address userAddress) public view returns(string memory)
   	{
		return addressTwitterID[userAddress];
   	}

   	function getAddressFromTwitterID(string memory twitterID) public view returns(address)
   	{
		return twitterIDAdress[twitterID];
   	}

   	function getProofLocation(uint256 contestID) 
		public 
	  	view 
	  	onlyValidContest(contestID)
	  	returns(string memory)
   	{
		require(contest[contestID].contestState >= EContestState.CONTEST_PROOF_DELIVERED);
		return contest[contestID].ipfsLocation;
   	}
   
   	function getWinnerTwitterID(uint256 contestID)
		public
		view
		onlyValidContest(contestID)
		returns(string memory)
	{
	  	require(contest[contestID].contestState >= EContestState.CONTEST_PROOF_DELIVERED); 
	  	return contest[contestID].winnerTwitterID;
	}

	function getContestRewardAmount(uint256 contestID)
		public
		view
		onlyValidContest(contestID)
		returns(uint256)
	{
		require(contest[contestID].contestState >= EContestState.CONTEST_CREATED);
		require(contest[contestID].contestState <= EContestState.CONTEST_WINNER_LOTTERY_DONE);
		return contest[contestID].rewardAmount;
	}

   	modifier onlyEmptyContest(uint256 newContestID) {
		require(newContestID > 0);
		require(contest[newContestID].contestOwner == address(0));
		_;
   	}

   	modifier onlyContestState(uint256 contestID, EContestState state) {
		require(contest[contestID].contestState == state);
		_;
   	}
   
	modifier onlyLink(address tokenAddress)
	{
		require(tokenAddress == linkTokenAddress);
		_;
	}
	
   	modifier onlyValidContest(uint256 contestID) {
		require(contest[contestID].contestID != 0);
	  	require(contest[contestID].rewardAmount != 0);
	  	_;
   	}
}