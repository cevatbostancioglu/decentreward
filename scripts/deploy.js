async function main() {
    const [deployer] = await ethers.getSigners();
  
    console.log("Deploying contracts with the account:", deployer.address);
  
    const Oracle = await ethers.getContractFactory("Oracle");
    const oracle = await Oracle.deploy(process.env.KOVAN_LINK_TOKEN_CONTRACT_ADDRESS);
  
    console.log("Oracle address:", oracle.address);
  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });