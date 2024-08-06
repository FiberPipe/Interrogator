"use client";

import { AppRouter } from "./providers/router/AppRouter";
import { Footer, Header } from "../widgets";
import { NextUIProvider } from "@nextui-org/react";
import { useNavigate } from "react-router-dom";
import "./styles/globals.css";
import { PageContainer } from "../shared/ui";

const App = () => {
  const navigate = useNavigate();
  return (
    <>
      <NextUIProvider navigate={navigate}>
        <Header />
        <PageContainer>
          <AppRouter />
        </PageContainer>
        <Footer />
      </NextUIProvider>
    </>
  );
};

export default App;
