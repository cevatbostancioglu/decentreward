require("@nomiclabs/hardhat-waffle");

// Replace this private key with your Kovan account private key
// To export your private key from Metamask, open Metamask and
// go to Account Details > Export Private Key
// Be aware of NEVER putting real Ether into testing accounts
const KOVAN_PRIVATE_KEY = process.env.KOVAN_PRIVATE_KEY;

const INFURA_API_TOKEN = process.env.INFURA_API_TOKEN 

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: {compilers: [{version:"0.6.6"}, {version :"0.8.7"}]},
  networks: {
    kovan: {
      url: `https://kovan.infura.io/v3/${INFURA_API_TOKEN}`,
      accounts: [`${KOVAN_PRIVATE_KEY}`]
    }
  }
};

