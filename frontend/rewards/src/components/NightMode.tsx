import { EditablePreview, 
    Box, 
    useColorModeValue, 
    Button,
    IconButton,
    Icon,
    Input, 
    useDisclosure, 
    useEditableControls, 
    ButtonGroup, 
    SlideFade, 
    Editable, 
    Tooltip, 
    EditableInput,
    useColorMode,
    Switch,
    Flex } from "@chakra-ui/react";
  
import { MoonIcon } from '@chakra-ui/icons';

export default function ToggleNightMode() {
    const { colorMode, toggleColorMode } = useColorMode()
    return (
      <header>
        <IconButton aria-label='LightMode' icon={<MoonIcon />} 
            onClick={toggleColorMode}>
            {colorMode === 'light' ? 'Dark' : 'Light'}
        </IconButton>
      </header>
    )
}