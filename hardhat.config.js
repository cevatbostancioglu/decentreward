require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");

// Replace this private key with your Kovan account private key
// To export your private key from Metamask, open Metamask and
// go to Account Details > Export Private Key
// Be aware of NEVER putting real Ether into testing accounts
const KOVAN_PRIVATE_KEY2 = process.env.KOVAN_PRIVATE_KEY2;

const INFURA_API_TOKEN = process.env.INFURA_API_TOKEN;

const ETHERSCAN_API_KEY= process.env.ETHERSCAN_API_KEY;

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: {compilers: [{version:"0.6.6"}, {version :"0.8.7"}, {version: "0.7.0"}]},
  networks: {
    kovan: {
      url: `https://kovan.infura.io/v3/${INFURA_API_TOKEN}`,
      accounts: [`${KOVAN_PRIVATE_KEY2}`]
    },
    rinkeby : {
      url: `https://rinkeby.infura.io/v3/${INFURA_API_TOKEN}`,
      accounts: [`${KOVAN_PRIVATE_KEY2}`]
    }
  },
  etherscan: {
    apiKey: {
      kovan:`${ETHERSCAN_API_KEY}`,
      rinkeby:`${ETHERSCAN_API_KEY}`,    
    },
  },
};

