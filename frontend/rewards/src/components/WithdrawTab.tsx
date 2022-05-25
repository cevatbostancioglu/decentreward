import {
  Input,
  Flex,
  Text,
  Button,
  Link,
  Image,
  useControllableState
} from "@chakra-ui/react";

import { ExternalLinkIcon } from '@chakra-ui/icons';

import { ContractInstanceAxios } from './ContractReadInstanceAxios';

import { UseUCreateNewContest } from "../hooks";
import { utils } from "ethers";
import { useEthers, useEtherBalance } from "@usedapp/core";

import decentrewardsbotprofile from "../assets/decentrewardsbotprofile.png"; 


const parser = require("twitter-url-parser");

export default function WithdrawTab() {
  
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
                <Text>Tweet URL for withdraws</Text>
                    <Input placeholder="Tweet URL" w="15%" />
              
                <Text mt={3} mb={3} > Winner can DM @decentrewardsbot on twitter.</Text>
                <Link href="https://twitter.com/DecentRewardBot" isExternal > @DecentRewardsBot<ExternalLinkIcon mx="2px" /></Link>
                <p></p>
                <Image src={decentrewardsbotprofile} alt="twitter bot profile" mt={5} />
    </Flex>
  );
}
