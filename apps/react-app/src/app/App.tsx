import { useNavigate } from "react-router-dom";
import "./styles/global.css";
import { NextUIProvider } from "@nextui-org/react";
import { AppRouter } from "./providers/router/AppRouter";
import { Footer, Header } from "../widgets";
import { PageContainer } from "../shared";

const App = () => {
  const navigate = useNavigate();
  return (
    <>
      <NextUIProvider navigate={navigate}>
        <div className={"page"}>
          <Header />
          <PageContainer>
            <AppRouter />
          </PageContainer>
          <Footer />
        </div>
      </NextUIProvider>
    </>
  );
};

export default App;
