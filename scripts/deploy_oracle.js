async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying oracle/consumer contracts with the account:", deployer.address);

  const Operator = await ethers.getContractFactory("Operator");
  //process.env.KOVAN_LINK_TOKEN_CONTRACT_ADDRESS  
  const oracle_contract = await Operator.deploy(process.env.RINKEBY_LINK_TOKEN_CONTRACT_ADDRESS, deployer.address);

  console.log("deploying apiconsumer contract.");

  const ApiConsumer = await ethers.getContractFactory("ApiConsumer");

  const consumer_contract = await ApiConsumer.deploy(
      process.env.RINKEBY_LINK_TOKEN_CONTRACT_ADDRESS, oracle_contract.address);
  
  console.log("await oracle/apiconsumer contract deployment.");

  await oracle_contract.deployed()
  await consumer_contract.deployed()
   
  console.log("oracle_contract address:", oracle_contract.address);
  console.log("consumer_contract address:", consumer_contract.address);

  saveFrontendFiles(oracle_contract, "Operator", "oracle-contract-address.json", "oracle-contract.json");
  saveFrontendFiles(consumer_contract, "ApiConsumer", "consumer-contract-address.json", "consumer-contract.json");
  
  console.log("checking node auth status on oracle contract");

  let authSender = await oracle_contract.isAuthorizedSender(process.env.CHAINLINK_RINKEBY_LOCALNODE_ETH_ADDRESS);

  if (authSender == false)
  {
    console.log("authSender false, setting local node.");
    let tx = await oracle_contract.setAuthorizedSenders([process.env.CHAINLINK_RINKEBY_LOCALNODE_ETH_ADDRESS]);
    tx.wait();
  }

  console.log("done.");

  //todo: send link to consumer contract.

}

function saveFrontendFiles(contract, name, contract_address_filename, contractabi_filename) {
  const fs = require("fs");
  const contractsDir = __dirname;

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  fs.writeFileSync(
    contractsDir + "/" + contract_address_filename,
    JSON.stringify({ name: contract.address }, undefined, 2)
  );

  const contractArtifact = artifacts.readArtifactSync(name);

  fs.writeFileSync(
    contractsDir + "/" + contractabi_filename,
    JSON.stringify(contractArtifact, null, 2)
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });