const { ethers } = require('hardhat');

async function supplyEth(deployer, amount, target)
{
  console.log("Node balance is running low, sending eth to node.");
  // Create a transaction object
  let tx = {
    to: target,
    // Convert currency unit from ether to wei
    value: ethers.utils.parseEther(amount.toString())
  }
  
  console.log("deployer send");
  await deployer.sendTransaction(tx)
  .then((txObj) => {
    console.log("Node fund done, txHash:", txObj.hash);
  })
}

async function supplyLink(contract, amount, target)
{
  console.log("Protocol link balance is running low, sending link to protocol.");
  
  await contract.transfer(target, ethers.utils.parseUnits(amount.toString(), 18))
  .then(response=> {
    console.log(response);
  });
}

async function main() {
    const provider = new ethers.providers.InfuraProvider(process.env.NETWORK_NAME, 
          process.env.INFURA_PROJECT_ID, process.env.INFURA_PROJECT_SECRET);
   
    const [deployer] = await ethers.getSigners();
    
    const fs = require('fs');
    
    console.log("Funding contracts with the account:", deployer.address);

    const oracleContractArtifact = JSON.parse(fs.readFileSync("./scripts/oracle-contract.json"));
    const oracleContractAddress = JSON.parse(fs.readFileSync("./scripts/oracle-contract-address.json")).name;

    const rewardsContractArtifact = JSON.parse(fs.readFileSync("./scripts/contract.json"));
    const rewardsContractAddress = JSON.parse(fs.readFileSync("./scripts/contract-address.json")).name;
    
    const chainlinkContractArtifact = JSON.parse(fs.readFileSync("./scripts/erc20_default.json"));
    const chainlinkContractAddress = process.env.RINKEBY_LINK_TOKEN_CONTRACT_ADDRESS;

    const chainlinkTokenContract = new ethers.Contract(chainlinkContractAddress, chainlinkContractArtifact, deployer);
    
    const balance = await provider.getBalance(process.env.CHAINLINK_RINKEBY_LOCALNODE_ETH_ADDRESS);
    
    const balanceEth = ethers.utils.formatEther(balance)
    console.log("CL Node balanceEth: ", balanceEth);
    
    if ( balanceEth < 0.25)
    {
      await supplyEth(deployer, 
          Number(0.25) - Number(balanceEth), 
          process.env.CHAINLINK_RINKEBY_LOCALNODE_ETH_ADDRESS);
    }
    else
    {
      console.log("CL Node holds enough eth.");
    }

    const balanceoflink = await chainlinkTokenContract.balanceOf(rewardsContractAddress)
    const balanceLink = ethers.utils.formatEther(balanceoflink)
    console.log(`Rewards Contract balanceLink: ${balanceLink} Link`)

    if( balanceLink < 10)
    {
      let amount = 10 - balanceLink;
      await supplyLink(chainlinkTokenContract, amount, rewardsContractAddress);
    }
    else
    {
      console.log(">= 5");
    }
}

  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });