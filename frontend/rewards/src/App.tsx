import { ChakraProvider, useDisclosure } from "@chakra-ui/react";
import theme from "./theme";
import Layout from "./components/Layout";
import { Banner } from "./components/Banner";
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
        <AccountModal isOpen={isOpen} onClose={onClose} />
      </Banner>
      <OptionTabs ></OptionTabs>
    </ChakraProvider>
  );
}

export default App;
