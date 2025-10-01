import { useNavigate } from "react-router-dom";
import "./styles/global.css";
import { AppRouter } from "./providers/router/AppRouter";
import { Header } from "../widgets";
import { InputProvider, PageContainer } from "../shared";
import React from "react";
import { HeroUIProvider } from "@heroui/react";

const App = () => {
  const navigate = useNavigate();

  React.useEffect(() => {
    window.electron.subscribe("message", (data) => {
      console.log(data);
    });
  }, []);

  return (
    <InputProvider initialInputs={{ someKey: "hello" }}>
      <HeroUIProvider navigate={navigate}>
        <div className={"page"}>
          <Header />
          <PageContainer>
            <AppRouter />
          </PageContainer>
        </div>
      </HeroUIProvider>
    </InputProvider>
  );
};

export default App;
