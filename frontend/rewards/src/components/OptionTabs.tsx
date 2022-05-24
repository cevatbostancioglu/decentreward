import { Flex, Tabs, Text,
    TabList, 
    TabPanels, 
    Tab, 
    TabPanel, 
    FormControl,
    FormLabel,
    FormHelperText,
    Input,
    InputGroup,
    Button, Link, Divider, Image,
    List, ListItem, ListIcon,
    useControllableState } from '@chakra-ui/react'

import { AddIcon, ArrowRightIcon, ExternalLinkIcon } from '@chakra-ui/icons';

import { useEthers, useEtherBalance } from "@usedapp/core";
import { formatEther } from "@ethersproject/units";

import { ContractInstanceAxios } from './ContractReadInstanceAxios';

import decentrewardsbotprofile from "../assets/decentrewardsbotprofile.png"; 

import DepositTab from './Deposit';
import CreateTab from './Create';

export default function OptionTabs() {

    /* wallet */
    const { account } = useEthers();
    const etherBalance = useEtherBalance(account);

    /* status tab */
    const [ statustwURL, setStatustwURL ] = useControllableState({defaultValue: ""})
    const [contestState, setContestState] = useControllableState({defaultValue: 0});
    /* end of deposit tab */

    function getContestState() {
        ContractInstanceAxios.getContestState(statustwURL.toString())
        .then(response => {
            setContestState(Number(response.data))
        })
        .catch(error => {
            //"Cannot Find contest for given twitter
            setContestState(error)
        })
    }

    /* end of status tab */

    return (
        <Flex width="full" align="center" justifyContent="center">
        <Tabs variant='soft-rounded' colorScheme='gray' align='center' isFitted mt={20}>
        <TabList>
            <Tab>Desosit</Tab>
            <Tab>Create</Tab>
            <Tab>Status</Tab>
            <Tab>Proofs</Tab>
            <Tab>Withdraws</Tab>
        </TabList>

        <TabPanels >
            <TabPanel>
                <DepositTab />
            </TabPanel>
            <TabPanel>
                <CreateTab />
            </TabPanel>
            <TabPanel>
                <Text>Status Tweet URL</Text>
                <Input placeholder="Check Tweet URL Reward Status" w="100%" 
                        value={statustwURL} onChange={(e) => {setStatustwURL(e.target.value)}} />
                <Input placeholder="state" w="30%" value={contestState} />
                <Text>Check status on chain using 0x123.</Text>
                <Link href="https://etherscan.io/" isExternal> Etherscan Manual Check<ExternalLinkIcon mx="2px" /></Link>
                <p></p>
                <Button mt={4} colorScheme='teal' leftIcon={<ArrowRightIcon />} onClick={getContestState}> Check Status</Button>
                <Divider orientation='horizontal' mb={3} mt={3} w="30%"/>
                <List spacing={3}>
                    <ListItem>
                        <ListIcon as={AddIcon} color='green.500' />
                        Contest created for tweet
                    </ListItem>
                    <ListItem>
                        <ListIcon as={AddIcon} color='green.500' />
                        Random and Proof Requested
                    </ListItem>
                    <ListItem>
                        <ListIcon as={AddIcon} color='green.500' />
                        Random Delivered
                    </ListItem>
                    {/* You can also use custom icons from react-icons */}
                    <ListItem>
                        <ListIcon as={AddIcon} color='red.500' />
                        Proof Delivered
                    </ListItem>
                    <ListItem>
                        <ListIcon as={AddIcon} color='gray.500' />
                        Winner selected
                    </ListItem>
                    <ListItem>
                        <ListIcon as={AddIcon} color='gray.500' />
                        Ended
                    </ListItem>
                </List>
            </TabPanel>
            <TabPanel>
                <FormControl>
                <FormLabel>Tweet URL</FormLabel>
                <InputGroup size="md">
                    <Input pr='4.5rem' placeholder="Tweet URL Proof" w="15%" />
                </InputGroup>
                <FormHelperText>Checks IPFS location</FormHelperText>
                <Link href="https://etherscan.io/" isExternal> Etherscan Manual Check<ExternalLinkIcon mx="2px" /></Link>
                <p></p>
                <Button mt={4} colorScheme='teal' leftIcon={<ArrowRightIcon />} > Check Proof</Button>
                <Divider orientation='horizontal' mt={3} w="30%"/>
                <List spacing={3}>
                    <ListItem>
                        <ListIcon as={AddIcon} color='gray.500' />
                        Winner Twitter ID:
                    </ListItem>
                    <ListItem>
                        <ListIcon as={AddIcon} color='gray.500' />
                        Winner Proof Location:
                    </ListItem>
                </List>
                </FormControl>
            </TabPanel>
            <TabPanel>
                <FormControl>
                <FormLabel>Tweet URL for withdraws</FormLabel>
                <InputGroup size="md">
                    <Input pr='4.5rem' placeholder="Tweet URL" w="15%" />
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
        </Flex>
    );
}