import {
    IconButton,
    useColorMode,
    } from "@chakra-ui/react";
  
import { MoonIcon } from '@chakra-ui/icons';

export default function ToggleNightMode() {
    const { colorMode, toggleColorMode } = useColorMode()
    return (
      <header>
        <IconButton aria-label='LightMode' icon={<MoonIcon />}
            onClick={toggleColorMode}>
            {colorMode === 'light' ? 'Dark' : 'Light'}
            variant="ghost"
        </IconButton>
      </header>
    )
}