import { useNavigate } from "react-router-dom";
import "./styles/global.css";
import { HeroUIProvider } from "@heroui/react";
import { Settings } from "../pages/Settings";

const App = () => {
  const navigate = useNavigate();

  return (
      <HeroUIProvider navigate={navigate}>
        <Settings/>
      </HeroUIProvider>
  );
};

export default App;
