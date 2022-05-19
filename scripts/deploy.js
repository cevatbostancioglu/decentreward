async function main() {
    const [deployer] = await ethers.getSigners();
  
    console.log("Deploying contracts with the account:", deployer.address);
  
    const DRewards = await ethers.getContractFactory("DRewards");
    const drewards_contract = await DRewards.deploy(process.env.RINKEBY_LINK_TOKEN_CONTRACT_ADDRESS);;
    //process.env.KOVAN_LINK_TOKEN_CONTRACT_ADDRESS
    /*
    if (process.env.NETWORK_NAME == "rinkeby")
    {drewards_contract = await DRewards.deploy(process.env.RINKEBY_LINK_TOKEN_CONTRACT_ADDRESS);}
    else 
    {drewards_contract = await DRewards.deploy(process.env.KOVAN_LINK_TOKEN_CONTRACT_ADDRESS);}
    */
    await drewards_contract.deployed()

    console.log("drewards_contract address:", drewards_contract.address);

    saveFrontendFiles(drewards_contract, "DRewards");
  }

  function saveFrontendFiles(contract, name) {
    const fs = require("fs");
    const contractsDir = __dirname;
  
    if (!fs.existsSync(contractsDir)) {
      fs.mkdirSync(contractsDir);
    }
  
    fs.writeFileSync(
      contractsDir + "/contract-address.json",
      JSON.stringify({ name: contract.address }, undefined, 2)
    );
  
    const contractArtifact = artifacts.readArtifactSync(name);
  
    fs.writeFileSync(
      contractsDir + "/contract.json",
      JSON.stringify(contractArtifact, null, 2)
    );
  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });