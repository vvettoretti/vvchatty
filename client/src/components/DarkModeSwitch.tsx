import { Switch, useColorMode } from "@chakra-ui/react";

const DarkModeSwitch = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const isDark = colorMode === "dark";
  return (
    <Switch
      color="green"
      isChecked={isDark}
      onChange={toggleColorMode}
    ></Switch>
  );
};
export default DarkModeSwitch;
