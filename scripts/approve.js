async function main() {
    const [deployer] = await ethers.getSigners();
  
    console.log("Link Approval with the account:", deployer.address);
    let abi = ["function approve(address _spender, uint256 _value) public returns (bool success)"];
    
    let contract = new ethers.Contract(process.env.KOVAN_LINK_TOKEN_CONTRACT_ADDRESS, abi);
    
    await contract.approve(deployer, ethers.utils.parseEther("100"));

    console.log("drewards_contract address:", drewards_contract.address);

  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });