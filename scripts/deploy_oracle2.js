async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying oracle/consumer contracts with the account:", deployer.address);

  const oracleContractArtifact = JSON.parse(fs.readFileSync("/home/cevat/.chainlink-kovan/decentreward/scripts/oracle-contract.json"));
  const oracleContractAddress = JSON.parse(fs.readFileSync("/home/cevat/.chainlink-kovan/decentreward/scripts/oracle-contract-address.json"));

  console.log("deploying apiconsumer contract.");

  const ApiConsumer = await ethers.getContractFactory("ApiConsumer");

  const consumer_contract = await ApiConsumer.deploy(
      process.env.RINKEBY_LINK_TOKEN_CONTRACT_ADDRESS, oracleContractAddress.name);
  
  console.log("await oracle/apiconsumer contract deployment.");

  await consumer_contract.deployed()
   
  console.log("oracle_contract address:", oracleContractAddress.name);
  console.log("consumer_contract address:", consumer_contract.address);

  saveFrontendFiles(consumer_contract, "ApiConsumer", "consumer-contract-address.json", "consumer-contract.json");
  
  console.log("checking node auth status on oracle contract");

  let authSender = await oracleContractArtifact.isAuthorizedSender(process.env.CHAINLINK_RINKEBY_LOCALNODE_ETH_ADDRESS);

  if (authSender == false)
  {
    console.log("authSender false, setting local node.");
    let tx = await oracleContractArtifact.setAuthorizedSenders([process.env.CHAINLINK_RINKEBY_LOCALNODE_ETH_ADDRESS]);
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