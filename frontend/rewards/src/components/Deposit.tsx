import { useState } from "react";
import {
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

export default function DepositTab() {
  
  /* wallet */
  const { account } = useEthers();
  const etherBalance = useEtherBalance(account);

  //const onChainBalance = UseGetEtherBalanceWithAdress(account ? account.toString(): "0");
  const { state, send: sendDepositEther } = useContractMethod("depositEther");

  const [depositRequestAmount, setDepositRequestAmount] = useControllableState({defaultValue: 0})
  const [onChainDeposit, setOnChainDeposit] = useControllableState({defaultValue: "0"})

  function ContractDepositEther()
  {
    sendDepositEther({value: utils.parseEther(depositRequestAmount.toString())});
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
      <Text>Deposit Amount</Text>
      <NumberInput placeholder="Enter amount" w="60%" min={0} alignItems="center"
          precision={4} step={0.01} allowMouseWheel={true} inputMode="numeric"
          onFocus={GetEtherBalanceWithAdress}
          value={depositRequestAmount} onChange={e=>setDepositRequestAmount(Number(e))} >
              <NumberInputField />
              <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
              </NumberInputStepper>
          </NumberInput>
          <Text>ethBalance: {etherBalance && parseFloat(utils.formatEther(etherBalance)).toFixed(3)} ETH</Text>
          <Text >{account ? (onChainDeposit != "0" ? "ethBalanceOnContract:" + onChainDeposit + " ETH" : ("Click to see Balance")) : 
              ("Connect Wallet to see Balance")} </Text>
      <Button mt={4} colorScheme='teal' leftIcon={<AddIcon />} onClick={ContractDepositEther} > Deposit </Button>
    </Flex>
  );
}
