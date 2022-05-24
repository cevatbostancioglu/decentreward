import {
  Input,
  Flex,
  Text,
  Button,
  NumberInput, NumberInputField, NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper,
  useControllableState
} from "@chakra-ui/react";

import { AddIcon } from '@chakra-ui/icons';

import { ContractInstanceAxios } from './ContractReadInstanceAxios';

import { 
  useContractMethod  } from "../hooks";
import { utils } from "ethers";
import { useEthers, useEtherBalance } from "@usedapp/core";

const parser = require("twitter-url-parser");

export default function CreateTab() {
  
  /* wallet */
  const { account } = useEthers();
  const etherBalance = useEtherBalance(account);

  const { state, send: sendUCreateNewContest } = useContractMethod("u_createNewContest");

  const [depositRequestAmount, setDepositRequestAmount] = useControllableState({defaultValue: 0})
  const [onChainDeposit, setOnChainDeposit] = useControllableState({defaultValue: "0"})

  const [ createtwURL, setCreatetwURL ] = useControllableState({defaultValue: ""})

  function ContractDepositEther()
  {
    GetEtherBalanceWithAdress()
    //sendDepositEther({value: utils.parseEther(depositRequestAmount.toString())});
  }

  function CreateNewContest()
  {
      /*
      if (parseFloat(onChainDeposit) > 0)
      {
          alert("You cannot create contest, you balance is 0, please deposit.");
      }*/
      var result = parser(createtwURL);
      var twID = result.id
      // result.id = 1521567077773058048

      ContractInstanceAxios.getContestState(twID)
      .then(response => {
        alert("Contest Already Registered.")
      })
      .catch(error => {
        sendUCreateNewContest({rewardAmount: onChainDeposit, tweetID: twID});  
      })

      
  }

  function GetEtherBalanceWithAdress()
  {
    ContractInstanceAxios.getEtherBalanceWithAdress(account ? account.toString() : '0')
        .then(response => {
          setOnChainDeposit(response.data ? response.data : "<cannot update>");
        })
        .catch(error => {
            //"Cannot Find contest for given twitter
            setOnChainDeposit(error)
        })
  }

  return (
    <Flex direction="column" align="center" mt="4">
      <Text>Create Tweet URL</Text>
        
        <Input placeholder="Tweet URL for lottery" w="100%"  
        alignItems="center" onFocus={GetEtherBalanceWithAdress} 
        value={createtwURL} onChange={(e) => {setCreatetwURL(e.target.value)}} />

        <Text >ethBalance: {etherBalance && parseFloat(utils.formatEther(etherBalance)).toFixed(3)} ETH</Text>
        <Text >{account ? (onChainDeposit != "0" ? "ethBalanceOnContract:" + onChainDeposit + " ETH" : ("Click to see Balance")) : 
              ("Connect Wallet to see Balance")} </Text>
        <Button mt={4} colorScheme='teal' leftIcon={<AddIcon />} onClick={CreateNewContest}> Create New </Button>
    </Flex>
  );
}
