pragma solidity ^0.8.7;
// SPDX-License-Identifier: MIT

// @godmodeinvestor => 0x70B674D9220aC9022420023A8C1034EcfaDc0E3B -> 308399201
// @decentrewardbot => 0x06b911ACca1000823054D9f17424198b076faF86 -> 1518535984320851968

import "../openzeppelin-contracts/contracts/access/Ownable.sol";
import "../openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";


//import "./IDPairing.sol";
// VRF
import "../chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "../chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "../chainlink/contracts/src/v0.8/ChainlinkClient.sol";

//import "./ApiConsumer.sol";

//import "../chainlink/contracts/src/v0.8/KeeperCompatible.sol";

contract DRewards is Ownable, ChainlinkClient {
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

   uint256 public latestContestID = 1;

   event TransferReceived(address _from, uint _amount);
   event TransferSent(address _from, address _destAddr, uint _amount);

   enum EContestState
   {
       CONTEST_EMPTY,
       CONTEST_CREATED, /* CONTEST ID, REWARDS, CONTEST OWNER */
       CONTEST_CANDIDATES_REQUESTED, /* candidates ids requested*/
       CONTEST_CANDIDATES_DELIVERED, /* candidates ids delivered */
       CONTEST_RANDOM_REQUESTED, /* RANDOM REQUEST */
       CONTEST_RANDOM_GENERATED, /* RANDOM GENERATED */
       CONTEST_WINNER_LOTTERY_DONE, /* WINNER ANNOUNCED */
       CONTEST_REWARDS_DISTRIBUTED, /* REWARDS DISTRIBUTED */
       CONTEST_END
   }

   // rewards
   struct DReward {
      uint256 contestID;    /* ID for indexing */
      address contestOwner; /* eth address */
      uint256 contestWinner;/* winnerIndex*/
      uint256 rewardAmount; /* in eth for now*/
      uint256 vrfRequestID; /* vrf request async handling*/
      string  tweetID;      /* tweet id for contest      */
      bytes32 tweetLikedByDataDeliveryRequestID; /* candidates */
      uint256 randomSeed;   /* random seed from vrf/keccak */
      EContestState contestState; /* state of contest */
      uint256 rewardsDone;        /* not used. */
      string[] candidatesIDs;     /* tweet liked by */
   }

   mapping(uint256 => uint256) contestRandomTable;            // vrf requestID -> contest ID
   mapping(bytes32 => uint256) candidatesIDRequestTable;      // data requestID -> contest ID 

    // userAddress => tokenAddress => token amount
    mapping(address => mapping (address => uint256)) userDeposits;

   // userAdress => eth amount
   mapping(address => uint) userEthDeposits; 

   // userAddress <=> twitterID
   mapping(address => uint256) addressTwitterID;
   mapping(uint256 => address) twitterIDAdress;

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

    // ERC20 all
    event tokenDepositComplete(address tokenAddress, uint256 amount);
    event tokenWithdrawComplete(address tokenAddress, uint256 amount);
    event updateContestState(uint256 contestID, EContestState state);

   // eth deposit

   event ethDepositComplete(address user, uint amount);

   /* erc20 deposit disabled */
    function approveToken(uint256 amount) public onlyOwner
    {

    }

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

    function depositEther() public payable returns(uint)
    {
      userEthDeposits[msg.sender] += msg.value;
      emit ethDepositComplete(msg.sender, msg.value);
      return userEthDeposits[msg.sender];
    }

   function getEtherBalanceWithAdress(address user) public view returns(uint)
   {
      return userEthDeposits[user];
   }

   mapping(uint256 => DReward) contest;
   
  function setTwitterID(address userAddress, uint256 twitterID)
   public
   onlyOwner
   {
      require(twitterID > 0);
      addressTwitterID[userAddress] = twitterID;
      twitterIDAdress[twitterID] = userAddress;
   }

   function readTwitterID(address userAddress) public view returns(uint256)
   {
      return addressTwitterID[userAddress];
   }

   function readAddressFromTwitterID(uint256 twitterID) public view returns(address)
   {
      return twitterIDAdress[twitterID];
   }

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
      contest[latestContestID].rewardAmount += rewardAmount;
      contest[latestContestID].contestState = EContestState.CONTEST_CREATED;
      //userDeposits[msg.sender][linkTokenAddress] -= rewardAmount;
      userEthDeposits[msg.sender] -= rewardAmount;
      emit updateContestState(latestContestID, contest[latestContestID].contestState);
      
      latestContestID++;

      return (latestContestID - 1);
   }

   function bot_createNewContest(address contestOwner, uint256 rewardAmount, string memory tweetID) 
        public 
        onlyOwner
        onlyEmptyContest(latestContestID)
        {
      require(rewardAmount > 0);
      require(userEthDeposits[contestOwner] <= rewardAmount, 
         "Your reward amount must be greater then you already deposit.");

      require(bytes(tweetID).length > 0);
      
      contest[latestContestID].contestOwner = contestOwner;
      contest[latestContestID].contestID = latestContestID;
      contest[latestContestID].tweetID = tweetID;
      userEthDeposits[contestOwner] -= rewardAmount;
      contest[latestContestID].rewardAmount += rewardAmount; // sum amount
      contest[latestContestID].contestState = EContestState.CONTEST_CREATED;
      //userDeposits[contestOwner][linkTokenAddress] -= rewardAmount;
      latestContestID++;

      emit updateContestState(latestContestID, contest[latestContestID].contestState);
   }
   
   /**
   * @notice Request variable bytes from the oracle
   */
   function requestTweetLikesByTweetID(uint256 contestID)
      public
      onlyContestState(contestID, EContestState.CONTEST_CREATED)
   {
      // only owner or user itself.
      Chainlink.Request memory req = buildChainlinkRequest(specId, address(this), this.fulfillBytes.selector);
      req.add("tweetID", contest[contestID].tweetID);
      bytes32 reqID = sendOperatorRequest(req, payment);

      candidatesIDRequestTable[reqID] = contestID;
      contest[contestID].contestState = EContestState.CONTEST_CANDIDATES_REQUESTED;
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
      uint256 contestID = candidatesIDRequestTable[requestId];
      
      /*
      require(contestID > 0);
      require(contest[contestID].rewardAmount > 0);
      require(candidatesIDs.length > 0);
      public onlyOwner
        onlyContestState(contestID, EContestState.CONTEST_CREATED)
      */
      contest[contestID].candidatesIDs = _data;
      contest[contestID].contestState = EContestState.CONTEST_CANDIDATES_DELIVERED;
      
      emit updateContestState(contestID, contest[contestID].contestState);
   }
   
   function getRewardAmount(uint256 contestID) 
    public 
    view 
    onlyValidContest(contestID) 
    returns(uint256)
   {
      return contest[contestID].rewardAmount;
   }

   function getContestTwitterID(uint256 contestID)
   public
   view
   onlyValidContest(contestID) 
    returns(string memory)
   {
      return contest[contestID].tweetID;
   }
   
   function getTotalNumberOfContest()
   public
   view
   returns(uint256)
   {
      return latestContestID;
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

   function getCandicates(uint256 contestID) 
      public 
      view 
      onlyValidContest(contestID)
      returns(string[] memory)
   {
      require(contest[contestID].contestState >= EContestState.CONTEST_CANDIDATES_DELIVERED);
      return contest[contestID].candidatesIDs;
   }
   
   function triggerRewardDistrobution(uint256 contestID) 
      public  
      onlyValidContest(contestID)
      onlyContestState(contestID, EContestState.CONTEST_RANDOM_GENERATED)
   {
      // only user or owner.
      uint256 winnerIndex = contest[contestID].randomSeed % contest[contestID].candidatesIDs.length;
      
      require(winnerIndex <= contest[contestID].candidatesIDs.length - 1);
      
      contest[contestID].contestState = EContestState.CONTEST_WINNER_LOTTERY_DONE;
      //contest[contestID].candidatesIDs[winnerIndex];
      contest[contestID].contestWinner = winnerIndex;
      emit updateContestState(contestID, contest[contestID].contestState);
   }
   
   function getWinnerID(uint256 contestID)
    public
    view
    onlyValidContest(contestID)
    returns(uint256)
    {
      require(contest[contestID].contestState >= EContestState.CONTEST_WINNER_LOTTERY_DONE); 
      return contest[contestID].contestWinner;
    }

    function getWinnerID2(uint256 contestID)
    public
    view
    onlyValidContest(contestID)
    returns(uint256)
    {
      require(contest[contestID].contestState >= EContestState.CONTEST_WINNER_LOTTERY_DONE); 
      return contest[contestID].randomSeed % contest[contestID].candidatesIDs.length;;
    }


    
    function getWinnerRewardAmount(uint256 contestID)
        public
        view
        onlyValidContest(contestID)
        returns(uint256)
    {
        return contest[contestID].rewardAmount;
    }

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
        contestWinner.transfer(contest[contestID].rewardAmount);
        emit updateContestState(contestID, contest[contestID].contestState);
    }

   // VRF
   // Assumes the subscription is funded sufficiently.
   function requestRandomSeed(uint256 contestID) 
    external 
    onlyValidContest(contestID) 
    onlyOwner
    onlyContestState(contestID, EContestState.CONTEST_CANDIDATES_DELIVERED)
    { 
      contest[contestID].randomSeed = uint256(keccak256(abi.encodePacked(block.timestamp,block.difficulty, msg.sender)));
      contest[contestID].contestState = EContestState.CONTEST_RANDOM_REQUESTED; /* vrf is not available now. */
      contest[contestID].contestState = EContestState.CONTEST_RANDOM_GENERATED;
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
      contestRandomTable[contest[contestID].vrfRequestID] = contestID;
      */
   }

   function fulfillRandomWords(
    uint256 requestID, /* requestId */
    uint256[] memory randomWords
   ) internal  
   {
       /* override */
      contest[contestRandomTable[requestID]].randomSeed = randomWords[0];
      contest[contestRandomTable[requestID]].contestState = EContestState.CONTEST_RANDOM_GENERATED;
      emit updateContestState(contestRandomTable[requestID], contest[contestRandomTable[requestID]].contestState);
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