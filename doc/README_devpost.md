# Decentralized Rewards Project
-----------------------------

## Inspiration

People need to trust each other for share anything. This statement is true for investment management, time, debt, employment, renting or lets say anything valuable. People always need to trust someone or instutions to keep their promises and trust models always improved themselves overtime. Nowadays we have aggrements, instutions with reputations to run most of infrastructure for society to function and it reached the limits. If history proves us anything about human nature, its proves human nature is corrupted over and over again, we need new model to trust each other more and share more things and that model is cryptographic truth.

Cryptography and blockchains provides almost everything for people to share anything valuable with other people and this is what modern world requires to expand.

**Most of the Web3 assets rewards/giveaways are organized on Web2 platforms in old fashion way. Organizers decides who to win(lack of transperency and trust issue), people commenting their Web3 addresses to get prizes(lack of software automotion), bots are attending everything(filtering issue), organizers are distributing their assets to bots, organizers main targets are giving up because people cannot compete with bots, because lack of transperency, trust issues, economically worst results for both sides. It creates more issues then they solve and giveaways/rewards does not worth to spent time on with current model.**

## What it does

Decentralized Rewards Project creates automation infrastructure for people organize giveaways using Web2 platforms for Web3 assets. It provides truth/trust model for both giveaway organizers and candidates/users.

Decentralized Rewards Project is a solution for web3 rewards/giveaways issues on web2 platforms by utulizing Smart Contracts, Chainlink services and IPFS storage service. Decentralized Rewards project fetches data from Web2 platforms, deliver proof of distribution data using Chainlink External API over local Chainlink Node to the smart contract platform, randomly chooces winner using Chainlink VRF, creates and stores all the rewards/giveaways information on IPFS web3.storage, binds Web2 and Web3 identities to each other using Web3 secure signature, distribute rewards to winner's Web2 identity on-chain.

Also it provides Web2 API endpoint to Web3 platforms. Web3 protocols/platforms can reach the Web2 data using Decentralized Rewards Oracle and this will expands and drives our crypto industry adoption to old fashion world.

## How we built it

Decentralized Rewards Project smart contracts are running on Ethereum Rinkeby Test network now. Organizers can deposit to our contract on test network, organize giveaways on twitter and users can get their rewards.

Decentralized Rewards Project backend implements Twitter V1/V2 Developer API to fetch/post from/to Twitter. Backend also communicates with local Chainlink node to fetch corresponding data request from smart contracts. Backend reads generated random number from on-chain, fetches corresponding candidates from Twitter and computes winner selection algorithm. All this requests/fetches/computations are saved as proof on IPFS web3.storage publicly. Project delivers corresponding distribution information(winners) and Computation Proof IPFS location to smart contract.

Decentralized Rewards Project utilizes Chainlink VRF as true random generator. Random numbers are used in winner decision algorithm. So everyone knows assets are  fairly distributed.

Organizers/users **can manage their rewards/giveaways by sending Twitter Direct Message** to our Bot account(@DecentRewardBot) or they can manage from Web Interface or Etherscan. Organizers/Users can use Twitter Direct Message for everything except on-chain deposit. Project web interface is capable of doing everyting but i believe managing on-chain assets using **Twitter Direct Messages will reduces the attack surface**. Project future prospect is using Web Interface as documentation only and managing everything using Twitter Direct Message.

## Challenges we ran into

- Data trust: If Oracle delivers corrupted data on-chain hurts every participants. In order to make sure computation is secure and fair, data providers needs to build reputation and put their stake as colletral behind the data they provided. Our documentation explains our prospects to secure off-chain computation and API endpoints.

- Proof storage: First iteration was computing winner selection algorithm on-chain, which requires all the candidates delivered to on-chain. This was not a economically feasible solution so we overcome this by storing proof on IPFS Web3.storage and delivering only proof location to on-chain.

- Blockchain limitations, test network issues: Developers can setup smart contract development environment locally but that does not provide same timing issues and data delivery services. Also test networks are less maintained and can be easily congested.

- Web2 API limitations:
Twitter API V2 offers essential/elevated/academic research packages. Using their API with current request limits creates scalability and API serving issues in project itself. It can be solved using Chainlink Decentrealized Oracle Network technology.

These challenges are not completly solved now but changed our perspective about Chainlink's Decentrealized Oracle Networks. Our future prospect is enabling Decentrealized Oracle Network service to overcome current challenges. DONs can overcome API request limitations by load balancing. Data trust issues can be solved by Chainlink's Explicit Staking model.(https://blog.chain.link/explicit-staking-in-chainlink-2-0/)

## Accomplishments that we're proud of

- End to End proof of rewards/giveaways in a modern/automated way with fair true randomness and secure off-chain computation.
- Transperency of data flow.
- Social impact on crypto twitter.
- Providing Web2 Endpoint to Web3 ecosystem using Chainlink Oracle solution.
- Creating a better and fair asset distribution, building trust across new world and old fashion world.

## What we learned

- Chainlink Node operation
- Smart Contract limitations
- Smart Contract API Endpoint development with Chainlink Oracles
- Importance of randomness, trust, proof words and desiging systems to ensure they can be acceptable by everyone.
- Web2 Identity - Web3 identity binding and asset management

## What's next for DecentRewardBot

- Enable Decentrealized Oracle Network to overcome current limitations
- Enable all types of asset management on-chain(erc20, nft's etc.)
- Enable rewards/giveaway distribution on multiple-chains using Chainlink Data Delivery Technology
- Enable technology for managing Web3 assets from Web2 world in a most secure way.
- Enable other Web3 projects to use DecentRewards project as management interface.
- Build cryptographically secure trust between Web2/Web3 world.