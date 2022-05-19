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
//import "../chainlink/contracts/src/v0.8/KeeperCompatible.sol";

contract DRewards is Ownable {
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

   uint256 latestContestID = 1;

   event TransferReceived(address _from, uint _amount);
   event TransferSent(address _from, address _destAddr, uint _amount);

   enum EContestState
   {
       CONTEST_EMPTY,
       CONTEST_CREATED, /* CONTEST ID, REWARDS, CONTEST OWNER */
       CONTEST_CANDICATES_DELIVERED, /* candicates ids delivered */
       CONTEST_RANDOM_REQUESTED, /* RANDOM REQUEST */
       CONTEST_RANDOM_GENERATED, /* RANDOM GENERATED */
       CONTEST_WINNER_LOTTERY_DONE, /* WINNER ANNOUNCED */
       CONTEST_REWARDS_DISTRIBUTED, /* REWARDS DISTRIBUTED */
       CONTEST_END
   }

   // rewards
   struct DReward {
      uint256 contestID;
      address contestOwner;
      uint256 contestWinner;
      uint256 rewardAmount;
      uint256 vrfRequestID;
      uint256 randomSeed;
      EContestState contestState;
      uint256 rewardsDone;
      uint256[] candicatesIDs;
   }

   mapping(uint256 => uint256) contestRandomTable; // requestID -> contest ID

    // userAddress => tokenAddress => token amount
    mapping(address => mapping (address => uint256)) userDeposits;

   // userAdress => eth amount
   mapping(address => uint) userEthDeposits; 

   // userAddress => twitterID
   mapping(address => uint256) addressTwitterID;
   mapping(uint256 => address) twitterIDAdress;

   constructor(address _linkTokenAddress)
   {
       linkTokenAddress = _linkTokenAddress;
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

    function depositFakeEther(address user, uint amount) public onlyOwner
    {
      userEthDeposits[user] += amount;
      emit ethDepositComplete(user, amount);
    }

   function getEtherBalanceWithAdress(address user) public view returns(uint)
   {
      return userEthDeposits[user];
   }

   mapping(uint256 => DReward) contest;
   
   event candicatesDelivered(DReward indexed contest);

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

  function u_createNewContest(uint256 rewardAmount) 
        public 
        onlyEmptyContest(latestContestID)
        {
      require(rewardAmount > 0);
      /*require(userDeposits[msg.sender][linkTokenAddress] <= rewardAmount, 
                "Your reward amount must be greater then you already deposit.");
      */
      require(userEthDeposits[msg.sender] <= rewardAmount, 
         "Your reward amount must be greater then you already deposit.");
      contest[latestContestID].contestOwner = msg.sender;
      contest[latestContestID].contestID = latestContestID;
      contest[latestContestID].rewardAmount += rewardAmount; // sum amount
      contest[latestContestID].contestState = EContestState.CONTEST_CREATED;
      //userDeposits[msg.sender][linkTokenAddress] -= rewardAmount;
      userEthDeposits[msg.sender] -= rewardAmount;
      emit updateContestState(latestContestID, contest[latestContestID].contestState);
      
      latestContestID++;
   }

   function bot_createNewContest(uint256 contestID, address contestOwner, uint256 rewardAmount) 
        public 
        onlyOwner
        onlyEmptyContest(contestID)
        {
      require(rewardAmount > 0);
      require(userEthDeposits[contestOwner] <= rewardAmount, 
         "Your reward amount must be greater then you already deposit.");
      
      contest[contestID].contestOwner = contestOwner;
      contest[contestID].contestID = contestID;
      contest[contestID].rewardAmount += rewardAmount; // sum amount
      contest[contestID].contestState = EContestState.CONTEST_CREATED;
      //userDeposits[contestOwner][linkTokenAddress] -= rewardAmount;
      userEthDeposits[contestOwner] -= rewardAmount;
      latestContestID++;

      emit updateContestState(contestID, contest[contestID].contestState);
   }
   
   function deliverCandicates(uint256 contestID, uint256[] memory candicatesIDs) 
        public onlyOwner
        onlyContestState(contestID, EContestState.CONTEST_CREATED)
    {
      require(contestID > 0);
      require(contest[contestID].rewardAmount > 0);
      require(candicatesIDs.length > 0);
      
      contest[contestID].candicatesIDs = candicatesIDs;
      contest[contestID].contestState = EContestState.CONTEST_CANDICATES_DELIVERED;
      
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
   
   function getCandicates(uint256 contestID) 
      public 
      view 
      onlyValidContest(contestID) 
      returns(uint256[] memory)
   {
      return contest[contestID].candicatesIDs;
   }
   
   function triggerRewardDistrobution(uint256 contestID) 
      public  
      onlyValidContest(contestID)
      onlyContestState(contestID, EContestState.CONTEST_RANDOM_GENERATED)
   {
      uint256 winnerIndex = contest[contestID].randomSeed % contest[contestID].candicatesIDs.length;
      
      require(winnerIndex <= contest[contestID].candicatesIDs.length - 1);
      
      contest[contestID].contestState = EContestState.CONTEST_WINNER_LOTTERY_DONE;
      contest[contestID].contestWinner = contest[contestID].candicatesIDs[winnerIndex];

      emit updateContestState(contestID, contest[contestID].contestState);
   }
   
   function getWinnerID(uint256 contestID)
    public
    view
    onlyValidContest(contestID)
    onlyContestState(contestID, EContestState.CONTEST_WINNER_LOTTERY_DONE)
    returns(uint256)
    {
        return contest[contestID].contestWinner;
    }
    
    function getWinnerRewardAmount(uint256 contestID)
        public
        view
        onlyValidContest(contestID)
        onlyContestState(contestID, EContestState.CONTEST_WINNER_LOTTERY_DONE)
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
        contestWinner.transfer(contest[contestID].rewardAmount);
        contest[contestID].contestState = EContestState.CONTEST_END;
        emit updateContestState(contestID, contest[contestID].contestState);
    }

   // VRF
   // Assumes the subscription is funded sufficiently.
   function requestRandomSeed(uint256 contestID) 
    external 
    onlyValidContest(contestID) 
    onlyOwner
    onlyContestState(contestID, EContestState.CONTEST_CANDICATES_DELIVERED)
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
      require(contest[contestID].candicatesIDs.length > 0);
      require(contest[contestID].contestID != 0);
      require(contest[contestID].rewardAmount != 0);
      _;
   }
}