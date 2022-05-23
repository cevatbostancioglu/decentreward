import { Tabs, 
    TabList, 
    TabPanels, 
    Tab, 
    TabPanel, 
    FormControl,
    FormLabel,
    FormHelperText,
    Input,
    InputGroup,
    InputLeftElement,
    InputRightElement, Button, Link, Divider, Image,
    List, ListItem, ListIcon, OrderedList, UnorderedList,
    useControllableProp, useControllableState } from '@chakra-ui/react'

import { AddIcon, ArrowRightIcon, ExternalLinkIcon } from '@chakra-ui/icons';
import { MdCheckCircle, MdDangerous, MdSettings } from 'react-icons/md';

import { useEthers, useEtherBalance } from "@usedapp/core";
import { formatEther } from "@ethersproject/units";

import decentrewardsbotprofile from "../assets/decentrewardsbotprofile.png"; 

export default function OptionTabs() {

    const { activateBrowserWallet, account } = useEthers();
    const etherBalance = useEtherBalance(account);

    const [value, setValue] = useControllableState({defaultValue: ''});

    function validateDeposit(value: number)
    {
        let error;
        if (value >= Number(etherBalance))
        {
            error='Deposit value must be lower than your total balance. 😱'
        }

        return error
    }

    return (
        <Tabs>
        <TabList>
            <Tab>Desosit</Tab>
            <Tab>Create</Tab>
            <Tab>Status</Tab>
            <Tab>Proofs</Tab>
            <Tab>Withdraws</Tab>
        </TabList>

        <TabPanels>
            <TabPanel>
                <FormControl>
                <FormLabel>Deposit Amount</FormLabel>
                <InputGroup size="md">
                    <Input pr='4.5rem' placeholder="Enter amount" id="depositamount" w="15%" />
                </InputGroup>
                <FormHelperText>ethBalance: {etherBalance && parseFloat(formatEther(etherBalance)).toFixed(3)} ETH</FormHelperText>
                <FormHelperText>ethBalanceOnContract: 0.5 ETH</FormHelperText>
                <Button mt={4} colorScheme='teal' leftIcon={<AddIcon />} > Deposit </Button>
                </FormControl>
            </TabPanel>
            <TabPanel>
                <FormControl>
                <FormLabel>Tweet URL</FormLabel>
                <InputGroup size="md">
                    <Input pr='4.5rem' placeholder="Tweet URL for lottery" id="tweeturl" w="30%" />
                </InputGroup>
                <FormHelperText>ethBalance: {etherBalance && parseFloat(formatEther(etherBalance)).toFixed(3)} ETH</FormHelperText>
                <FormHelperText>ethBalanceOnContract: 0.5 ETH</FormHelperText>
                <Button mt={4} colorScheme='teal' leftIcon={<AddIcon />} > Create New </Button>
                </FormControl>
            </TabPanel>
            <TabPanel>
                <FormControl>
                <FormLabel>Tweet URL</FormLabel>
                <InputGroup size="md">
                    <Input pr='4.5rem' placeholder="Check Tweet URL Reward Status" id="tweeturl" w="30%" />
                </InputGroup>
                <FormHelperText>Check status on chain using 0x123.</FormHelperText>
                <Link href="https://etherscan.io/" isExternal> Etherscan Manual Check<ExternalLinkIcon mx="2px" /></Link>
                <p></p>
                <Button mt={4} colorScheme='teal' leftIcon={<ArrowRightIcon />} > Check Status</Button>
                <Divider orientation='horizontal' mt={3} w="30%"/>
                <List spacing={3}>
                    <ListItem>
                        <ListIcon as={MdCheckCircle} color='green.500' />
                        Contest created for tweet
                    </ListItem>
                    <ListItem>
                        <ListIcon as={MdCheckCircle} color='green.500' />
                        Random and Proof Requested
                    </ListItem>
                    <ListItem>
                        <ListIcon as={MdCheckCircle} color='green.500' />
                        Random Delivered
                    </ListItem>
                    {/* You can also use custom icons from react-icons */}
                    <ListItem>
                        <ListIcon as={MdDangerous} color='red.500' />
                        Proof Delivered
                    </ListItem>
                    <ListItem>
                        <ListIcon as={MdDangerous} color='gray.500' />
                        Winner selected
                    </ListItem>
                    <ListItem>
                        <ListIcon as={MdDangerous} color='gray.500' />
                        Ended
                    </ListItem>
                </List>
                </FormControl>
            </TabPanel>
            <TabPanel>
                <FormControl>
                <FormLabel>Tweet URL</FormLabel>
                <InputGroup size="md">
                    <Input pr='4.5rem' placeholder="Tweet URL Proof" id="depositamount" w="15%" />
                </InputGroup>
                <FormHelperText>Checks IPFS location</FormHelperText>
                <Link href="https://etherscan.io/" isExternal> Etherscan Manual Check<ExternalLinkIcon mx="2px" /></Link>
                <p></p>
                <Button mt={4} colorScheme='teal' leftIcon={<ArrowRightIcon />} > Check Proof</Button>
                <Divider orientation='horizontal' mt={3} w="30%"/>
                <List spacing={3}>
                    <ListItem>
                        <ListIcon as={MdCheckCircle} color='gray.500' />
                        Winner Twitter ID:
                    </ListItem>
                    <ListItem>
                        <ListIcon as={MdCheckCircle} color='gray.500' />
                        Winner Proof Location:
                    </ListItem>
                </List>
                </FormControl>
            </TabPanel>
            <TabPanel>
                <FormControl>
                <FormLabel>Tweet URL for withdraws</FormLabel>
                <InputGroup size="md">
                    <Input pr='4.5rem' placeholder="Tweet URL" id="tweeturl" w="15%" />
                </InputGroup>
                <FormHelperText mt={3} mb={3} >You will sign a message and send signed message to @decentrewardsbot on twitter.</FormHelperText>
                <Link href="https://twitter.com/DecentRewardBot" isExternal > @DecentRewardsBot<ExternalLinkIcon mx="2px" /></Link>
                <p></p>
                <Button mt={4} colorScheme='teal' leftIcon={<AddIcon />} > Sign Message </Button>
                <Image src={decentrewardsbotprofile} alt="twitter bot profile" mt={5} />
                </FormControl>
            </TabPanel>
        </TabPanels>
        </Tabs>
    );
}