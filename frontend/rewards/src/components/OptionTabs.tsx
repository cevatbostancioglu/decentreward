import { Flex, Tabs,
    TabList, 
    TabPanels, 
    Tab, 
    TabPanel, 
} from '@chakra-ui/react'


import DepositTab from './Deposit';
import CreateTab from './Create';
import StatusTab from './StatusTab';
import WithdrawTab from './WithdrawTab';

export default function OptionTabs() {

    /* wallet */

    return (
        <Flex width="full" align="center" justifyContent="center">
        <Tabs variant='soft-rounded' colorScheme='gray' align='center' isFitted mt={20}>
        <TabList>
            <Tab>Deposit</Tab>
            <Tab>Create</Tab>
            <Tab>Status</Tab>
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
                <StatusTab />
            </TabPanel>
            <TabPanel>
                <WithdrawTab />
            </TabPanel>
        </TabPanels>
        </Tabs>
        </Flex>
    );
}