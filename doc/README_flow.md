
# Data Flow for managing rewards using Twitter Direct Message

```mermaid
sequenceDiagram
    participant Organizer
    participant User
    participant DM_BOT
    participant Contract
    Organizer->>DM_BOT: Sign latest block number
    DM_BOT->>Contract: Bind TwitterID-EthAddress
    User->>DM_BOT: Sign latest block number
    DM_BOT->>Contract: Bind TwitterID-EthAddress
    Organizer->>Contract: Deposit 0.01ETH
    Organizer->>Organizer: Tweet
    Organizer->>DM_BOT: Create <TweetID>
    DM_BOT->>Contract: Create <TweetID>
    Organizer->>DM_BOT: Status <TweetID>
    DM_BOT->>Organizer: <TweetID> contest started, reward=0.01ETH
    User->>DM_BOT: Status <TweetID>
    DM_BOT->>User: <TweetID> contest started, reward=0.01ETH
    User->>User: Like tweet/retweet
    Organizer->>DM_BOT: Finish <TweetID>
    Contract->>Contract: Request data from VRF and Twitter Oracle
    Contract->>Contract: VRF Oracle random number delivery
    Contract->>Contract: Twitter Oracle proof delivery
    User->>DM_BOT: Who is the winner ?
    DM_BOT->>Contract: Who is the winner ?
    Contract->>DM_BOT: Winner Twitter Uniq ID
    DM_BOT->>User: You are the winner.
    User->>User: Happy
    User->>DM_BOT: Withdraw <TweetID>
    DM_BOT->>Contract: Withdraw to User
    Contract->>Contract: Resolve Web3 address from TwitterID
    User->>User: Happy
    Organizer->>DM_BOT: Status <TweetID>
    DM_BOT->>Organizer: Proof IPFS Web3.Storage URL
    Organizer->>Organizer: Execute proof locally
    Organizer->>Organizer: Happy
```
## Execute proof locally
[README How anyone can execute proof locally](https://github.com/cevatbostancioglu/decentreward/blob/main/tools/README_proof.md)

# Data Flow for managing rewards Web Interface
```mermaid
sequenceDiagram
    participant Organizer
    participant User
    participant WEB
    participant Contract
    Organizer->>Contract: Deposit 0.01ETH
    Organizer->>Organizer: Tweet
    Organizer->>WEB: Create <TweetID>
    WEB->>Contract: Create <TweetID>
    Organizer->>WEB: Status <TweetID>
    WEB->>Organizer: <TweetID> contest started, reward=0.01ETH
    User->>WEB: Status <TweetID>
    WEB->>User: <TweetID> contest started, reward=0.01ETH
    User->>User: Like tweet/retweet
    Organizer->>WEB: Finish <TweetID>
    Contract->>Contract: Request data from VRF and Twitter Oracle
    Contract->>Contract: VRF Oracle random number delivery
    Contract->>Contract: Twitter Oracle proof delivery
    User->>WEB: Who is the winner ?
    WEB->>Contract: Who is the winner ?
    Contract->>WEB: Winner Twitter Uniq ID
    WEB->>User: Winner Twitter Uniq ID
    User->>User: Happy?
    User->>WEB: Withdraw <TweetID>
    WEB->>Contract: Withdraw to ethAddress(WEB3)
    Contract->>Contract: Compares winner twitterID web3 address and msg.sender twitter ID, it does not match.
    Contract->>User: Fails, Please Sign message using WEB3 address and DM signature to DM_BOT
    User->>User: Sign latest block number and DM's DM_BOT
    User->>WEB: Withdraw <TweetID>
    WEB->>Contract: Withdraw to ethAddress(WEB3)
    Contract->>Contract: Compares winner twitterID web3 address and msg.sender twitter ID, matches, success.
    Contract->>Contract: Withdraw to User WEB3 address.
    User->>User: Happy
```

# Smart Contract - Oracles - Backend - WEB2 - IPFS flow
```mermaid
sequenceDiagram
    participant Contract
    participant VRF_Oracle
    participant Twitter_Oracle
    participant Backend
    participant TwitterAPI
    participant IPFS
    Contract->>VRF_Oracle: Request Random
    Contract->>Twitter_Oracle: Request proof <TweetID>
    Twitter_Oracle->>Backend: Request proof <TweetID>
    Backend->>Contract: is VRF fulfilled?
    Backend->>Contract: is VRF fulfilled?
    Backend->>Contract: is VRF fulfilled?
    VRF_Oracle->>Contract: VRF delivery
    Backend->>Contract: read VRF delivery
    Backend->>TwitterAPI: Fetch <TweetID>
    Backend->>Backend: Giveaway ends
    Backend->>Backend: Compute Winner, create proof
    Backend->>IPFS: Upload Proof
    IPFS->>Backend: Proof location
    Backend->>Twitter_Oracle: Proof and winner Twitter uniqID
    Twitter_Oracle->>Contract: Proof and winner Twitter uniqID
```
