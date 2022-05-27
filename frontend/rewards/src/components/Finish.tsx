import {
  Input,
  Flex,
  Text,
  Button,
  useControllableState
} from "@chakra-ui/react";

import { ArrowRightIcon } from '@chakra-ui/icons';

import { ContractInstanceAxios } from './ContractReadInstanceAxios';

import { UseRequestProofFromNode } from "../hooks";
import { useEthers, useEtherBalance } from "@usedapp/core";

const parser = require("twitter-url-parser");

export default function FinishTab() {
  
  const { state, send: sendURequestProofFromNode } = UseRequestProofFromNode();
  
  const [ finishtwURL, setFinishtwURL ] = useControllableState({defaultValue: ""})

  function FinishContest()
  {
      var result = parser(finishtwURL);
      var twID = result.id

      sendURequestProofFromNode(twID);
      /*
      ContractInstanceAxios.getContestState(twID)
      .then(response => {
          if(response.data == 1)
          {
            sendURequestProofFromNode(twID);
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
      <Text>Finish Tweet URL</Text>
        
        <Input placeholder="Tweet URL for ending contest period" w="100%"  
        alignItems="center" 
        value={finishtwURL} onChange={(e) => {setFinishtwURL(e.target.value)}} />
        <Button mt={4} colorScheme='teal' leftIcon={<ArrowRightIcon />} 
          onClick={FinishContest}> Finish Reward </Button>
    </Flex>
  );
}
