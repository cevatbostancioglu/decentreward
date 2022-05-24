import { Box } from "@chakra-ui/react";
import { ReactNode } from "react";

//import brandLogo from '../assets/logo2.png'
import ToggleNightMode from './NightMode';

type Props = {
    children?: ReactNode;
  };

export function Banner( { children }: Props) {
    return (
        <header>
            <Box d="flex" alignItems="center" justifyContent="flex-start" mr={3} ml={3} w="30%">
                
            </Box>

            <Box d="flex" alignItems="center" justifyContent="end" mr={6} mt={5} w="%40" >
                {children}
                <ToggleNightMode ></ToggleNightMode>
                
            </Box>
        </header>
    )
}
//<Image boxSize="90px" src={brandLogo} alt="brand" />