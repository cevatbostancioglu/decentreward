import {
  Input,
  Flex,
  Text,
  Button,
  useControllableState
} from "@chakra-ui/react";

import { AddIcon } from '@chakra-ui/icons';

import { ContractInstanceAxios } from './ContractReadInstanceAxios';

import { UseUCreateNewContest } from "../hooks";
import { utils } from "ethers";
import { useEthers, useEtherBalance } from "@usedapp/core";

const parser = require("twitter-url-parser");

export default function CreateTab() {
  
  /* wallet */
  const { account } = useEthers();
  const etherBalance = useEtherBalance(account);

  const { state, send: sendUCreateNewContest } = UseUCreateNewContest();
  const [onChainDeposit, setOnChainDeposit] = useControllableState({defaultValue: "0"})

  const [ createtwURL, setCreatetwURL ] = useControllableState({defaultValue: ""})

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

      sendUCreateNewContest(twID);
      /*
      ContractInstanceAxios.getContestState(twID)
      .then(response => {
          if(response.data == 0)
          {
            sendUCreateNewContest(twID);
          }
      })
      .catch(error => {
        alert(error)
      })
      */
  }

  function GetEtherBalanceWithAddress()
  {
    ContractInstanceAxios.getEtherBalanceWithAddress(account ? account.toString() : '0')
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
        
        <Input placeholder="Tweet URL for reward distribution" w="100%"  
        alignItems="center" onFocus={GetEtherBalanceWithAddress} 
        value={createtwURL} onChange={(e) => {setCreatetwURL(e.target.value)}} />

        <Text >ethBalance: {etherBalance && parseFloat(utils.formatEther(etherBalance)).toFixed(3)} ETH</Text>
        <Text >{account ? (onChainDeposit != "0" ? "ethBalanceOnContract:" + onChainDeposit + " ETH" : ("Click to see Balance")) : 
              ("Connect Wallet to see Balance")} </Text>
        <Button mt={4} colorScheme='teal' leftIcon={<AddIcon />} onClick={CreateNewContest}> Create New </Button>
    </Flex>
  );
}
