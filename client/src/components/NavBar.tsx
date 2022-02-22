import { Flex, Text } from "@chakra-ui/react";
import DarkModeSwitch from "./DarkModeSwitch";

interface NavBarProps {
  onlineCount: number;
}

const NavBar = (props: NavBarProps) => {
  return (
    <Flex bg="blackAlpha.500" p="3">
      <Text>VVChatty</Text>

      <Flex ml="auto" gap="5">
        <Text>{props.onlineCount} online</Text>
        <DarkModeSwitch />
      </Flex>
    </Flex>
  );
};
export default NavBar;
