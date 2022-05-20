async function main() {
    const [deployer] = await ethers.getSigners();
    const fs = require('fs');
    console.log("Deploying contracts with the account:", deployer.address);

    const oracleContractArtifact = JSON.parse(fs.readFileSync("/home/cevat/.chainlink-kovan/decentreward/scripts/oracle-contract.json"));
    const oracleContractAddress = JSON.parse(fs.readFileSync("/home/cevat/.chainlink-kovan/decentreward/scripts/oracle-contract-address.json"));
    
    const DRewards = await ethers.getContractFactory("DRewards");
    
    const drewards_contract = await DRewards.deploy(process.env.RINKEBY_LINK_TOKEN_CONTRACT_ADDRESS,
      oracleContractAddress.name);;

    await drewards_contract.deployed()

    console.log("drewards_contract address:", drewards_contract.address);
    console.log("oracle_contract_address:", oracleContractAddress.name);

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