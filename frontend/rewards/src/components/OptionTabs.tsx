import { Flex, Tabs,
    TabList, 
    TabPanels, 
    Tab, 
    TabPanel, 
} from '@chakra-ui/react'


import DepositTab from './Deposit';
import CreateTab from './Create';
import StatusTab from './StatusTab';
import RegisterTab from './RegisterTab';
import FinishTab from './Finish';
import WithdrawTab from './WithdrawTab';

export default function OptionTabs() {

    /* wallet */

    return (
        <Flex width="full" align="center" justifyContent="center">
        <Tabs variant='soft-rounded' colorScheme='gray' align='center' isFitted mt={20}> {/* main tab start */}
            <TabList>
                <Tab>Contest Management</Tab>
                <Tab>Documents</Tab> 
            </TabList>

            <TabPanels>
                <TabPanel> {/* mgmt tab */}
                    <Tabs variant='soft-rounded' colorScheme='gray' align='center' isFitted mt={20}>
                        <TabList>
                            <Tab>Register</Tab>
                            <Tab>Deposit</Tab>
                            <Tab>Create</Tab>
                            <Tab>Status</Tab>
                            <Tab>Finish</Tab>
                            <Tab>Withdraw</Tab>
                        </TabList>

                        <TabPanels >
                            <TabPanel>
                                <RegisterTab />
                            </TabPanel>
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
                                <FinishTab />
                            </TabPanel>
                            <TabPanel>
                                <WithdrawTab />
                            </TabPanel>
                        </TabPanels>
                    </Tabs>
                </TabPanel> {/* end of mgmt tab */}
                <TabPanel> {/* Documents tab */}
                    
                </TabPanel> {/* Documents tab */}
            </TabPanels>
        </Tabs> {/* main tab end */}
        
        </Flex>
    );
}