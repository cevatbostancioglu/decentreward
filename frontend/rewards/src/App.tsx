import { ChakraProvider, useDisclosure } from "@chakra-ui/react";
import theme from "./theme";
import Layout from "./components/Layout";
import { Banner } from "./components/Banner";
import ApplicationStep from "./components/ApplicationStep";
import ContestInput from "./components/ContestInput";
import ConnectButton from "./components/ConnectButton";
import AccountModal from "./components/AccountModal";
import OptionTabs from "./components/OptionTabs";
import "@fontsource/inter";

function App() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  return (
    <ChakraProvider theme={theme}>
      <Banner>
        <ConnectButton handleOpenModal={onOpen} />
      </Banner>
      <OptionTabs></OptionTabs>
    </ChakraProvider>
  );
}
//<ConnectButton handleOpenModal={onOpen} />
/*
<Layout>
        <ApplicationStep />
        <ConnectButton handleOpenModal={onOpen} />
        <ContestInput />
        <AccountModal isOpen={isOpen} onClose={onClose} />
      </Layout>
*/
export default App;
