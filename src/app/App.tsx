import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./styles/global.css";
import { HeroUIProvider, Button } from "@heroui/react";
import { SettingsModal } from "../pages/Settings";
import { ErrorWrapper } from "./providers/ErrorWrapper";

const App = () => {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <HeroUIProvider navigate={navigate}>
      <ErrorWrapper>
        <div className="h-screen w-screen flex items-center justify-center bg-gray-800">
          <Button color="primary" onPress={() => setModalOpen(true)}>
            Open Serial Settings
          </Button>
        </div>

        <SettingsModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
        />
      </ErrorWrapper>
    </HeroUIProvider>
  );
};

export default App;
