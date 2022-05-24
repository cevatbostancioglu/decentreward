import { ethers } from "ethers";
import { Contract } from "@ethersproject/contracts";
import { useContractFunction } from "@usedapp/core";
import rewardContractAbi from "../assets/contract.json";
import { rewardContractAddress } from "../contracts";


const rewardContractInterface = new ethers.utils.Interface(rewardContractAbi);
const contract = new Contract(rewardContractAddress, rewardContractInterface);

/* web3provider setup is more complicated then backend communication
export function UseGetContestState(tweetID : string) {
  const contestState: any =
    useCall(rewardContractAddress && {
      contract: contract,
      method: "getContestState",
      args: [tweetID],
    }) ?? 0;
  console.log(contestState);
  return contestState;
}

export function UseGetEtherBalanceWithAdress(address : string) {
  const balance: any = 
    useCall(rewardContractAddress && {
      contract: contract,
      method: "getEtherBalanceWithAdress",
      args: [address],
    }) ?? 0;
    console.log("UseGetEtherBalanceWithAdress", balance);
    return balance;
}
*/

export function UseDepositEther() {
    //const contract = new Contract("0x7Aa5062CccD6d3240C42024daF554669A84550b9", rewardContractABI);

    const { state, send } = useContractFunction(contract, "depositEther", {});
    
    return { state, send }
    /*
    const depositEther = (depositRequestAmount: Number) => {
        send({value: depositRequestAmount})
    }
    */
}

export function useContractMethod(methodName: string) {
    const { state, send } = useContractFunction(contract, methodName, {});
    return { state, send };
}