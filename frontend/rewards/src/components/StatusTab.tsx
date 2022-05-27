import {
    Input,
    Flex,
    Text,
    Button,
    Link,
    List, ListItem, ListIcon,
    Divider,
    useControllableState
  } from "@chakra-ui/react";
  
  import { CheckIcon, CloseIcon, TimeIcon, SpinnerIcon, ArrowRightIcon, ExternalLinkIcon } from '@chakra-ui/icons';
  
  import { ContractInstanceAxios } from './ContractReadInstanceAxios';
  
  import { rewardContractAddress } from "../contracts";

  const parser = require("twitter-url-parser");
  
export default function StatusTab() {
    /* status tab */
    const [ statustwURL, setStatustwURL ] = useControllableState({defaultValue: ""})
    const [ statusTwID, setStatusTwID ] = useControllableState({defaultValue: ""})
    const [ proofIPFSHash, setProofIPFSHash ] = useControllableState({defaultValue: ""})

    const [contestState, setContestState] = useControllableState({defaultValue: 0});
    
    function getContestState() {
        var result = parser(statustwURL);
        var twID = result.id

        setStatusTwID(twID)

        ContractInstanceAxios.getContestState(twID)
        .then(response => {
            setContestState(Number(response.data))
        })
        .catch(error => {
            //axios errors etc.
            setContestState(error)
        })

        getProofLocation()
    }

    function getProofLocation() {
        ContractInstanceAxios.getProofLocation(statusTwID)
        .then(response => {
            setProofIPFSHash(response.data ? response.data.toString() : proofIPFSHash);
        })
        .catch(error => {
            //axios errors etc.
            setProofIPFSHash(error)
        })
    }

    return (
      <Flex direction="column" align="center" mt="4">
        <Text>Status Tweet URL</Text>
            <Input placeholder="Check Tweet URL Reward Status" w="100%" 
                        value={statustwURL} onChange={(e) => {setStatustwURL(e.target.value)}} />
                {/*<Input placeholder="state" w="30%" value={contestState} />*/}
                <Link mt={3} href={"https://rinkeby.etherscan.io/address/" + rewardContractAddress + "#readContract"} isExternal> Etherscan Manual Check <ExternalLinkIcon mx="2px" /></Link>
                <p></p>
                <Button mt={4} colorScheme='teal' leftIcon={<ArrowRightIcon />} 
                    onClick={getContestState}> Check Status</Button>
                <Divider orientation='horizontal' mb={3} mt={3} w="100%"/>
                <List spacing={4}>
                    <ListItem>
                        <ListIcon as={contestState === 0 ? CloseIcon : CheckIcon} color={contestState === 0 ? 'red.500' : 'green.500'} />
                        Contest created for tweet
                    </ListItem>
                    <ListItem>
                        <ListIcon as={contestState >= 1 ? TimeIcon :CloseIcon} color={contestState >= 1 ? 'green.500' : 'red.500'} />
                        Contest started
                    </ListItem>
                    <ListItem>
                        <ListIcon as={contestState >= 2 ? SpinnerIcon : CloseIcon} color={contestState >= 2 ? 'green.500' : 'red.500'} />
                        Random and Proof Requested
                    </ListItem>
                    <ListItem>
                        <ListIcon as={contestState >= 3 ? CheckIcon : CloseIcon} color={contestState >= 3 ? 'green.500' : 'red.500'} />
                        Random Delivered
                    </ListItem>
                    <ListItem>
                        <ListIcon as={contestState >= 4 ? CheckIcon : CloseIcon} color={contestState >= 4 ? 'green.500' : 'red.500'} />
                        <Link href={contestState >= 4 ? "https://" + proofIPFSHash + ".ipfs.dweb.link" : "" } isExternal> IPFS Proof Review <ExternalLinkIcon mx="2px" /></Link>
                    </ListItem>
                    <ListItem>
                        <ListIcon as={contestState >= 4 ? CheckIcon : CloseIcon} color={contestState >= 4 ? 'green.500' : 'red.500'} />
                        Winner can withdraw rewards using Withdraw Tab or Twitter DM.
                    </ListItem>
                    <ListItem>
                        <ListIcon as={contestState >= 6 ? CheckIcon : CloseIcon} color={contestState >= 5 ? 'green.500' : 'red.500'} />
                        Contest ended, rewards distributed.
                    </ListItem>
                </List>
      </Flex>
    );
}
  