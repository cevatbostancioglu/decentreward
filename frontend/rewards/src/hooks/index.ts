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

export function getEtherBalanceWithAddress(address : string) {
  const balance: any = 
    useCall(rewardContractAddress && {
      contract: contract,
      method: "getEtherBalanceWithAddress",
      args: [address],
    }) ?? 0;
    console.log("getEtherBalanceWithAddress", balance);
    return balance;
}
*/

export function UseDepositEther() {
    const { state, send } = useContractFunction(contract, "depositEther", {});
    
    return { state, send }
    /*
    const depositEther = (depositRequestAmount: Number) => {
        send({value: depositRequestAmount})
    }
    */
}

export function UseUCreateNewContest() {
  const { state, send} = useContractFunction(contract, "u_createNewContest", {});

  return {state, send};
}

export function UseRequestProofFromNode() {
  const {state, send} = useContractFunction(contract, "requestProofFromNode", {});
  
  return {state, send};
}

export function UseWithdrawWinnerReward() {
  const {state, send} = useContractFunction(contract, "withdrawWinnerReward", {});
  
  return {state, send};
}


export function useContractMethod(methodName: string) {
    const { state, send } = useContractFunction(contract, methodName, {});
    return { state, send };
}