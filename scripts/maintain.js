const ethers = require("ethers");
const fs = require("fs");

const main = async() => {
    const contractArtifact = JSON.parse(fs.readFileSync("./scripts/contract.json"));
    const contractAddress = JSON.parse(fs.readFileSync("./scripts/contract-address.json"));

    const provider = new ethers.providers.InfuraProvider("kovan", process.env.INFURA_PROJECT_ID, process.env.INFURA_PROJECT_SECRET);
    const test1 = new ethers.Wallet(process.env.KOVAN_PRIVATE_KEY, provider);
    const test2 = new ethers.Wallet(process.env.KOVAN_PRIVATE_KEY2, provider);
    
    console.log("deployer(test2):", test2.address);
    console.log("user(test1):", test1.address);
    console.log("contract_address:", contractAddress.name);

    // Then, we initialize the contract using that provider and the token's
    // artifact. You can do this same thing with your contracts.
    _contract_owner = new ethers.Contract(
        contractAddress.name,
        contractArtifact.abi,
        test2
    );
    _contract_user = new ethers.Contract(
      contractAddress.name,
      contractArtifact.abi,
      test1
  );

const getEtherBalanceWithAddress = async(ethAddress) => {
  console.log("getEtherBalanceWithAddress(" + ethAddress + ");");
  let check_balance = await _contract_owner.getEtherBalanceWithAddress(ethAddress.toString());
  return check_balance;
}

const main = async() => {
    let tx = await _contract_owner.owner();
    console.log("onchain contract owner(): ", tx);
    
    let twid_test2 = await _contract_owner.readTwitterID(test2.address.toString());

    if (twid_test2 != "1518535984320851968")
    {
      console.log("setting twid for test2, current twid_test2: ", twid_test2);
      tx = await _contract_owner.setTwitterID(test2.address.toString(),"1518535984320851968");
      console.log("setTwitterID hash ", tx.hash);
      tx.wait();
    }

    let twid_test1 = await _contract_owner.readTwitterID(test1.address.toString());

    if (twid_test1 != "308399202")
    {
      await new Promise(r => setTimeout(r, 10000));
      console.log("setting twid for test1, current twid_test1: ", twid_test1);
      tx = await _contract_owner.setTwitterID(test1.address.toString(),"308399202");
      console.log("setTwitterID hash ", tx.hash);
      tx.wait();
    }
    await new Promise(r => setTimeout(r, 10000));
    console.log("depositether.");
    let test1_balance = await _contract_owner.getEtherBalanceWithAdress(test1.address.toString());
    let test2_balance = await _contract_owner.getEtherBalanceWithAdress(test1.address.toString());

    if (test1_balance == "0")
    {
      tx = await _contract_owner.depositFakeEther(test1.address.toString(),"101");
      console.log("depositFakeEther1 hash ", tx.hash);
      tx.wait();
    }

    if (test2_balance == "0")
    {
      await new Promise(r => setTimeout(r, 10000));
      tx = await _contract_owner.depositFakeEther(test2.address.toString(),"102");
      console.log("depositFakeEther2 hash ", tx.hash);
      tx.wait();
    }

    /*let depositEther = {to: contractAddress.name, value: ethers.utils.parseEther("0.01")};
    
    tx = await test1.sendTransaction(depositEther);
    console.log("depositEther hash: ", tx.hash);
    tx.wait();
    */
}

main()
.then(() => process.exit(0))
.catch((error) => {
  console.error(error);
  process.exit(1);
});