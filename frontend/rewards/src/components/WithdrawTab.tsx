import {
  Input,
  Flex,
  Text,
  Button,
  useControllableState
} from "@chakra-ui/react";

import { ArrowRightIcon } from '@chakra-ui/icons';

import { ContractInstanceAxios } from './ContractReadInstanceAxios';

import { UseWithdrawWinnerReward } from "../hooks";
import { useEthers, useEtherBalance } from "@usedapp/core";

const parser = require("twitter-url-parser");

export default function WithdrawTab() {
  
  const { account } = useEthers();
  
  const { state, send: sendWithdrawWinnerReward } = UseWithdrawWinnerReward();
  
  const [ withdrawtwURL, setWithdrawtwURL ] = useControllableState({defaultValue: ""})

  function WithdrawReward()
  {
      var result = parser(withdrawtwURL);
      var twID = result.id

      sendWithdrawWinnerReward(twID, account);
      /*
      ContractInstanceAxios.getContestState(twID)
      .then(response => {
          if(response.data == 1)
          {
            sendWithdrawWinnerReward(twID);
          }
          else
          {
            alert("Contest state is either in requested or not created.");
          }
      })
      .catch(error => {
        alert(error)
      })
      */
  }

  return (
    <Flex direction="column" align="center" mt="4">
      <Text>Withdraw Winner Reward for following Tweet URL</Text>
        
        <Input placeholder="Tweet URL" w="100%"  
        alignItems="center" 
        value={withdrawtwURL} onChange={(e) => {setWithdrawtwURL(e.target.value)}} />
        <Button mt={4} colorScheme='teal' leftIcon={<ArrowRightIcon />} 
          onClick={WithdrawReward}> Withdraw Reward to this account </Button>
    </Flex>
  );
}
