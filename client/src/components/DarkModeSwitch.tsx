import { MoonIcon, SunIcon } from "@chakra-ui/icons";
import { IconButton, useColorMode } from "@chakra-ui/react";

const DarkModeSwitch = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const isDark = colorMode === "dark";
  return (
    <IconButton
      aria-label="toggle-dark-mode"
      icon={isDark ? <MoonIcon /> : <SunIcon />}
      onClick={toggleColorMode}
      variant="unstyled"
    />
  );
};
export default DarkModeSwitch;
