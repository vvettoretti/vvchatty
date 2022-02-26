import { Box, Center, Text } from "@chakra-ui/react";

interface MessageBoxProps {
  message: { text: string; mine: boolean };
}

const MessageBox: React.FC<MessageBoxProps> = ({ message }) => {
  return (
    <Box
      bg={message.mine ? "#43CC47" : "#1982FC"}
      mt="3"
      mb="3"
      ml="0.5"
      mr="0.5"
      // m="3em 0.5em 3em 0.5em"
      alignSelf={message.mine ? "flex-end" : "flex-start"}
      p="4"
      borderRadius="xl"
    >
      <Center>
        <Text fontSize="xl">{message.text}</Text>
      </Center>
    </Box>
  );
};
export default MessageBox;
