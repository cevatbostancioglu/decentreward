# Future with DONs

Flow:
- Organizer request rewards distribution and 3 Chainlink Nodes aggregate data and deliver data to multiple chains.
- DONN_2 dont have TwitterAPI, forwards request to DONN_1.
- DONN_1 is not in the DecentRewards Oracle network but responds to DONN_2 requests. DONN_2 imports DONN_1 data into InstagramAPI result.
- DONN_2 and DONN_3 aggregates on InstagramAPI results, DONN_3 accepts other API data too and DONN_2 deliver answer to multiple smart contract platforms.

Security:
- DON provides critical data
- Every DONN risks their future revenue, reputation, colletral for providing data.
- DON checks data and slashes bad behaving nodes.
- Smart Contracts make sure their TVL(total value locked) is always lower then DON TVS(total value secured).

```mermaid
graph TD;
    DON-->Node1;
    DON-->Node2;
    DON-->TVS;
    Node2-->Node3;
    TVS-->CL_ExplicitStaking
    CL_ExplicitStaking-->SmartContract
    SmartContract-->TVL_vs_TVS
    DONN_1-->TwitterAPI;
    TwitterAPI-->DONN_1;
    Request-->DONN_2;
    DONN_1-->DONN_2;
    DONN_2-->DONN_1;
    DONN_2-->InstagramAPI;
    InstagramAPI-->DONN_2;
    DONN_2-->DONN_3;
    DONN_3-->IPFS;
    DONN_3-->Web2API;
    DONN_3-->InstagramAPI;
    InstagramAPI-->DONN_3;
    Web2API-->DONN_3;
    IPFS-->DONN_3;
    SmartContract-->Request;
    DONN_3-->ResponseAggregate;
    DONN_2-->ResponseAggregate;
    ResponseAggregate-->SmartContract;
    ResponseAggregate-->SmartContract_AVAX;
    ResponseAggregate-->SmartContract_BNB;
    Organizer-->DistributeAllWEB2Rewards;
    DistributeAllWEB2Rewards-->SmartContract;
```

# Future with WEB3 asset management from WEB2 Platforms
```mermaid
sequenceDiagram
    participant User
    participant DM_BOT
    participant SmartContract
    User->>DM_BOT: uniswapv3.swap(wETH, renBTC);
    DM_BOT->>SmartContract: Resolve(USER).uniswapv3.swap(wETH, renBTC)
    SmartContract-->DM_BOT: Adds fee to DM_BOT eth addresss.
    SmartContract->>UniswapV3: uniswapv3.swap(wETH, renBTC)
    SmartContract-->SmartContract: User.balance += renBTC
    SmartContract-->SmartContract: User.balance -= wEth
    DM_BOT-->SmartContract: What is user current balances
    DM_BOT->>User: Done, your new balances..
```
