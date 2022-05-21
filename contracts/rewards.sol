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

	event updateContestState(string indexed tweetID, EContestState indexed state);

	// create new contest
  	function u_createNewContest(uint256 rewardAmount, string memory tweetID) 
		public 
		onlyEmptyContest(tweetID)
	{
		require(rewardAmount > 0);
	  	/*require(userDeposits[msg.sender][linkTokenAddress] <= rewardAmount, 
				"Your reward amount must be greater then you already deposit.");
	  	*/
	  	require(userEthDeposits[msg.sender] <= rewardAmount, 
				"Your reward amount must be greater then you already deposit.");
	  	
		require(bytes(tweetID).length > 0);

	  	contest[tweetID].contestOwner = msg.sender;
	  	userEthDeposits[msg.sender] = userEthDeposits[msg.sender].sub(rewardAmount);
	  	contest[tweetID].rewardAmount = contest[tweetID].rewardAmount.add(rewardAmount);
	  	contest[tweetID].contestState = EContestState.CONTEST_CREATED;
	  	//userDeposits[msg.sender][linkTokenAddress] = userDeposits[msg.sender][linkTokenAddress].sub(rewardAmount);
		
	  	emit updateContestState(tweetID, contest[tweetID].contestState);
   	}

   	function bot_createNewContest(address contestOwner, uint256 rewardAmount, string memory tweetID) 
		public 
		onlyOwner
		onlyEmptyContest(tweetID)
	{
		require(rewardAmount > 0);
	  	require(userEthDeposits[contestOwner] <= rewardAmount, 
			"Your reward amount must be greater then you already deposit.");

	  	require(bytes(tweetID).length > 0);
	  
	  	contest[tweetID].contestOwner = contestOwner;
		userEthDeposits[msg.sender] = userEthDeposits[msg.sender].sub(rewardAmount);
	  	contest[tweetID].rewardAmount = contest[tweetID].rewardAmount.add(rewardAmount);
		contest[tweetID].contestState = EContestState.CONTEST_CREATED;
	  	//userDeposits[msg.sender][linkTokenAddress] = userDeposits[msg.sender][linkTokenAddress].sub(rewardAmount);

		emit updateContestState(tweetID, contest[tweetID].contestState);
   	}

	// trigger reward distro
   	function triggerRewardDistrobution(string memory tweetID)
		public
	  	onlyValidContest(tweetID)
	  	onlyContestState(tweetID, EContestState.CONTEST_PROOF_DELIVERED)
   	{
		// only user or owner.
		contest[tweetID].contestState = EContestState.CONTEST_WINNER_LOTTERY_DONE;
		
		string memory _contestWinner = contest[tweetID].winnerTwitterID;
		winnerEthAmount[_contestWinner] = winnerEthAmount[_contestWinner].add(contest[tweetID].rewardAmount);

		emit updateContestState(tweetID, contest[tweetID].contestState);
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
	function withdrawWinnerReward(string memory tweetID, address payable contestWinner)
		public
		onlyOwner
		onlyValidContest(tweetID)
		onlyContestState(tweetID, EContestState.CONTEST_WINNER_LOTTERY_DONE)
	{
		/*require(IERC20(linkTokenAddress).transfer(contestWinner, contest[tweetID].rewardAmount), 
			"transfer failed.");
		*/
		require(winnerEthAmount[tweetID] > 0);
		contest[tweetID].contestState = EContestState.CONTEST_END;
		string memory _winnerTwitterID = contest[tweetID].winnerTwitterID;
		contestWinner.transfer(winnerEthAmount[_winnerTwitterID]);
		winnerEthAmount[_winnerTwitterID] = 0;
		emit updateContestState(tweetID, contest[tweetID].contestState);
	}

	/**
	* @notice Request variable bytes from the oracle
	* @TODO: double request issue. onlyContestStateGE -> onlyContestState
	*/
	function requestProofFromNode(string memory tweetID)
		public
		onlyOwner
	  	onlyContestStateGE(tweetID, EContestState.CONTEST_RANDOM_GENERATED)
   	{
		// only owner or user itself.
		Chainlink.Request memory req = buildChainlinkRequest(specId, address(this), this.fulfillBytes.selector);
		req.add("tweetID", tweetID);

		/*bytes32 reqID = */
		sendOperatorRequest(req, payment);

		contest[tweetID].contestState = EContestState.CONTEST_PROOF_REQUESTED;
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
		/*
		require(tweetID > 0);
		require(contest[tweetID].rewardAmount > 0);
		require(candidatesIDs.length > 0);
		public onlyOwner
			onlyContestState(tweetID, EContestState.CONTEST_CREATED)
		*/
		string memory tweetID = _data[0];
		contest[tweetID].winnerTwitterID = _data[1];
		contest[tweetID].ipfsLocation = _data[2];
		contest[tweetID].contestState = EContestState.CONTEST_PROOF_DELIVERED;
		
		triggerRewardDistrobution(tweetID);

		emit updateContestState(tweetID, contest[tweetID].contestState);
   	}

   	// VRF
   	// Assumes the subscription is funded sufficiently.
   	function requestRandomSeed(string memory tweetID) 
		external 
		onlyValidContest(tweetID) 
		onlyOwner
		onlyContestState(tweetID, EContestState.CONTEST_CREATED)
	{ 
	  	contest[tweetID].randomSeed = uint256(keccak256(abi.encodePacked(block.timestamp,block.difficulty, msg.sender))) % maxTwitterLikes;
		contest[tweetID].contestState = EContestState.CONTEST_RANDOM_REQUESTED; /* vrf is not available now. */
		contest[tweetID].contestState = EContestState.CONTEST_RANDOM_GENERATED;
		
		requestProofFromNode(tweetID);
		
		emit updateContestState(tweetID, contest[tweetID].contestState);
		/* VRF have problems.
		// Will revert if subscription is not set and funded.
		contest[tweetID].vrfRequestID = COORDINATOR.requestRandomWords(
			keyHash,
			s_subscriptionId,
			requestConfirmations,
			callbackGasLimit,
			1
		);
		contestVRFRequestIDTable[contest[tweetID].vrfRequestID] = tweetID;
		*/
   	}

   	function fulfillRandomWords(
		uint256 requestID, /* requestId */
		uint256[] memory randomWords
   	) internal  
   	{
		/* override */
		string memory tweetID = getContestIDFromVRFRequest(requestID);
		contest[tweetID].randomSeed = randomWords[0];
		contest[tweetID].contestState = EContestState.CONTEST_RANDOM_GENERATED;
		emit updateContestState(tweetID, contest[tweetID].contestState);
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
		returns(string memory)
	{
		require(bytes(contestVRFRequestIDTable[requestID]).length > 0);
		return contestVRFRequestIDTable[requestID];
	}

   	function getRandomSeed(string memory tweetID) 
		public 
		view 
		onlyValidContest(tweetID) 
		returns(uint256)
   	{
		require(contest[tweetID].contestState >= EContestState.CONTEST_RANDOM_GENERATED);
		return contest[tweetID].randomSeed;
   	}

   	function getContestState(string memory tweetID)
		public
		view
		onlyValidContest(tweetID)
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
		return twitterIDAdress[twitterID];
   	}

   	function getProofLocation(string memory tweetID) 
		public 
	  	view 
	  	onlyValidContest(tweetID)
	  	returns(string memory)
   	{
		require(contest[tweetID].contestState >= EContestState.CONTEST_PROOF_DELIVERED);
		return contest[tweetID].ipfsLocation;
   	}
   
   	function getWinnerTwitterID(string memory tweetID)
		public
		view
		onlyValidContest(tweetID)
		returns(string memory)
	{
	  	require(contest[tweetID].contestState >= EContestState.CONTEST_PROOF_DELIVERED); 
	  	return contest[tweetID].winnerTwitterID;
	}

	function getContestRewardAmount(string memory tweetID)
		public
		view
		onlyValidContest(tweetID)
		returns(uint256)
	{
		require(contest[tweetID].contestState >= EContestState.CONTEST_CREATED);
		require(contest[tweetID].contestState <= EContestState.CONTEST_WINNER_LOTTERY_DONE);
		return contest[tweetID].rewardAmount;
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

	modifier onlyLink(address tokenAddress)
	{
		require(tokenAddress == linkTokenAddress);
		_;
	}
	
   	modifier onlyValidContest(string memory tweetID) {
		require(bytes(tweetID).length > 0);
		require(contest[tweetID].contestOwner != address(0));
	  	require(contest[tweetID].rewardAmount != 0);
	  	_;
   	}
}