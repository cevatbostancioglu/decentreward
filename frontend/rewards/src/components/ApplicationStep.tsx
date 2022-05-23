import { EditablePreview, 
    Box, 
    useColorModeValue, 
    IconButton, 
    Input, 
    useDisclosure, 
    useEditableControls, 
    ButtonGroup, 
    SlideFade, 
    Editable, 
    Tooltip, 
    EditableInput,
    Flex,
    CircularProgress,
    CircularProgressLabel } from "@chakra-ui/react";
import { CheckIcon, CloseIcon, EditIcon } from "@chakra-ui/icons";


export default function ApplicationStep() {
   // Click the text to edit
   return (
        <CircularProgress isIndeterminate value={80} size='120px'>
            <CircularProgressLabel>URL</CircularProgressLabel>
        </CircularProgress>
   );
}