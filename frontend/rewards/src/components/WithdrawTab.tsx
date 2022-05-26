import {
  Flex,
  Button,
  Box,
  Divider,
  Link,
  List, ListItem, ListIcon,
  Image,
  useControllableState,
  useClipboard,
  Editable,
  EditableInput,
  EditablePreview,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Checkbox
} from "@chakra-ui/react";

import { ExternalLinkIcon, CloseIcon, CheckIcon, CopyIcon, ArrowRightIcon } from '@chakra-ui/icons';

import { ContractInstanceAxios } from './ContractReadInstanceAxios';

import { useEthers, useEtherBalance } from "@usedapp/core";

import decentrewardsbotprofile from "../assets/decentrewardsbotprofile.png"; 
import w_myetherwallet_message_signed from "../assets/w_myetherwallet_message_signed.png";
import w_myetherwallet_metamask_sign from "../assets/w_myetherwallet_metamask_sign.png";
import w_myetherwallet_signmessage from "../assets/w_myetherwallet_signmessage.png";
import w_twitter_send_signature from "../assets/w_twitter_send_signature.png";

export default function WithdrawTab() {
  
  /* wallet */
  const { account } = useEthers();

  const [ signatureChallenge, setSignatureChallenge ] = useControllableState({defaultValue: "Block-1234"})
  const { hasCopied, onCopy } = useClipboard(signatureChallenge)

  const [ onChainBind, setOnChainBind ] = useControllableState({defaultValue: false})

  function GetBlockNumber()
  {
    ContractInstanceAxios.getBlockNumber()
      .then(response => {
        if (response.data != "")
        {
          setSignatureChallenge("Block-" + response.data);
        }
        else
        {
          setSignatureChallenge("Block-" + response.data);
        }})
      .catch(error => {
        //axios errors etc.
        alert(error);
        setSignatureChallenge("Not available now. backend error.");
      })
  }

  function CheckTwitterBinding()
  {
    ContractInstanceAxios.getTwitterID(account ? account.toString() : "0")
      .then(response => {
        if (response.data != "")
        {
          setOnChainBind(true);
        }
        else
        {
          setOnChainBind(false);
          GetBlockNumber();
        }})
      .catch(error => {
        //axios errors etc.
        alert(error);
        setOnChainBind(false);
      })
  }

  return (
    <Flex direction="column" align="center" mt="4">
      <Button mt={4} colorScheme='teal' leftIcon={<ArrowRightIcon />} 
          onClick={CheckTwitterBinding}> Check On-Chain Binding </Button>
      <List spacing={4}>
        <ListItem mt={3} mb={3} >
          <ListIcon as={onChainBind == false ? CloseIcon : CheckIcon} color={onChainBind == false ? 'red.500' : 'green.500'} />
            {onChainBind == false ? 
            "You need to bind your ethereum address and social media profile by following steps." : 
            "You can withdraw rewards, just send DM with Contest URL to @DecentRewardBot"} </ListItem>
        <ListItem mt={3} mb={3} > 
            <Checkbox>Step 1 - Copy Following Text</Checkbox>
        </ListItem>
        <Editable defaultValue='Block-1234' isDisabled value={signatureChallenge} onChange={(e) => {setSignatureChallenge(e)}}>
          <EditablePreview />
          <EditableInput />
        </Editable>
        <Button mt={4} colorScheme='teal' leftIcon={<CopyIcon />} 
          onClick={onCopy}>Copy</Button>
        <p></p>
        <Link href="https://www.myetherwallet.com/wallet/sign" isExternal  mt={3} mb={3} >
          Step 2 - Visit MyEtherWallet<ExternalLinkIcon mx="2px" /></Link>

        <Accordion allowToggle>
          <AccordionItem>
            <h2>
              <AccordionButton>
                <Box flex='1' textAlign='left'>
                  Sign Message on MyEtherWallet
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4}>
              <Image src={w_myetherwallet_signmessage}></Image>
            </AccordionPanel>
          </AccordionItem>
          <AccordionItem>
            <h2>
              <AccordionButton>
                <Box flex='1' textAlign='left'>
                  Approve Message on Metamask
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4}>
              <Image src={w_myetherwallet_metamask_sign}></Image>
            </AccordionPanel>
          </AccordionItem>
          <AccordionItem>
            <h2>
              <AccordionButton>
                <Box flex='1' textAlign='left'>
                  Copy Signed Message on MyEtherWallet
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4}>
              <Image src={w_myetherwallet_message_signed}></Image>
            </AccordionPanel>
          </AccordionItem>
          <AccordionItem>
            <h2>
              <AccordionButton>
                <Box flex='1' textAlign='left'>
                  Send DM to @DecentRewardBot, Bot will bind ethereum address and twitter user id.
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4}>
              <Image src={w_twitter_send_signature}></Image>
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
      </List>
      <Link mt={3} mb={3} href="https://twitter.com/DecentRewardBot" isExternal > @DecentRewardBot Twitter<ExternalLinkIcon mx="2px" /></Link>
      <Divider orientation='horizontal' mb={3} mt={3} w="100%"/>

      <Image src={decentrewardsbotprofile} alt="twitter bot profile" mt={5} />

    </Flex>
  );
}
