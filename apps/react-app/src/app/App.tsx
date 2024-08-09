import { useNavigate } from "react-router-dom";
import "./styles/global.css";
import { NextUIProvider } from "@nextui-org/react";
import { AppRouter } from "./providers/router/AppRouter";
import { PageContainer } from "../shared/ui/PageContainer/PageContainer";
import { Footer } from "../widgets/Footer/Footer";
import { Header } from "../widgets/Header";

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
