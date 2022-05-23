import { Image, Flex, Box, Button } from "@chakra-ui/react";
import { ReactNode } from "react";

import ToggleNightMode from './NightMode';

type Props = {
    children?: ReactNode;
  };

export function Banner( { children }: Props) {
    return (
        <header>
            <Box d="flex" alignItems="center" justifyContent="space-between" mr={3} ml={3} w="50%">
                
            </Box>

            <Box d="flex" alignItems="center" justifyContent="end" mr={6} >
                {children}
                <ToggleNightMode  ></ToggleNightMode>
                
            </Box>
        </header>
    )
}
//<Image boxSize="90px" src={brandLogo} alt="brand" />