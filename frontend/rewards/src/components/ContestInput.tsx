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
    Flex } from "@chakra-ui/react";
import { CheckIcon, CloseIcon, EditIcon } from "@chakra-ui/icons";


export default function ContestInput() {
   // Click the text to edit
   return (<Editable 
            defaultValue='Twitter URL'
            textAlign='center'
            isPreviewFocusable={false}
            selectAllOnFocus={true}
            >
            <Tooltip label="Click to edit">
                <EditablePreview 
                    py={2}
                    px={4}
                    _hover={{
                        background: useColorModeValue("gray.100", "gray.700")
                    }}/>
            </Tooltip>
    <EditableInput />
    </Editable>
   );
}