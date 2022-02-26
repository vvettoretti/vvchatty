import { Flex, Text } from "@chakra-ui/react";
import DarkModeSwitch from "./DarkModeSwitch";

interface NavBarProps {
  onlineCount: number;
}

const NavBar: React.FC<NavBarProps> = ({ onlineCount }) => {
  return (
    <Flex bg="green.500" p="3" alignItems="center">
      <Text fontSize="xl">VVChatty</Text>
      <Flex ml="auto" gap="5" alignItems="center">
        <Text>{onlineCount} online</Text>
        <DarkModeSwitch />
      </Flex>
    </Flex>
  );
};
export default NavBar;
