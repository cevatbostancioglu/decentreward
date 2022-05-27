# Decentralized Rewards Project
-----------------------------

[Decentralized Rewards Project Github Repository](https://github.com/cevatbostancioglu/decentreward])

This document will explain technical aspect of project.

A project aiming to solve Web3 asset giveaways on Web2 platform using smart contracts, chainlink oracle services and IPFS web3.storage service.

[Chainlink Spring 2022 Hackathon devpost Link](https://github.com/cevatbostancioglu/decentreward])

## SW Architecture

All connections:
```mermaid
  graph TD;
      ChainlinkNode-->Operator.sol;
      Operator.sol-->ChainlinkNode;
      Operator.sol-->DecentRewardsContract;
      DecentRewardsContract-->Operator.sol
      DecentRewardsContract-->ChainlinkVRFv2;
      DecentRewardsContract-->IPFSWeb3.Storage;
      IPFSWeb3.Storage-->ComputationProof;
      ChainlinkVRFv2-->DecentRewardsContract
      DecentRewardsBackend-->ChainlinkNode;
      DecentRewardsBackend-->IPFSWeb3.Storage;
      DecentRewardsBackend-->Frontend;
      DecentRewardsBackend-->EthereumNodeRPC;
      DecentRewardsBackend-->DecentRewardBot;
      DecentRewardBot-->TwitterAPI.v1v2;
      TwitterAPI.v1v2-->DecentRewardBot;
      TwitterAPI.v1v2-->Tweet-DM-Status
      Frontend-->Metamask;
      Frontend-->DecentRewardsBackend;
      Metamask-->Frontend;
      Metamask-->USER
      Metamask-->Organizer
      Organizer-->Tweet-DM-Status
      Organizer-->Metamask
      EthereumNodeRPC-->DecentRewardsBackend;
      USER-->Metamask
      USER-->Tweet-DM-Status
```

[README developers](https://github.com/cevatbostancioglu/decentreward/blob/main/doc/README_dev.md)

[README Chainlink Hackathon Spring 2022 - devpost - informative](https://github.com/cevatbostancioglu/decentreward/blob/main/doc/README_devpost.md)

[README Data Flow across dapp/applications/servers/api endpoints](https://github.com/cevatbostancioglu/decentreward/blob/main/doc/README_flow.md)

[README Future prospects](https://github.com/cevatbostancioglu/decentreward/blob/main/doc/README_flow.md)

