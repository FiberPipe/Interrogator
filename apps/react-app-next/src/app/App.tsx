import React, { Fragment, useEffect } from "react";
import { ThemeProvider } from '@gravity-ui/uikit';
import '@gravity-ui/uikit/styles/fonts.css';
import '@gravity-ui/uikit/styles/styles.css';
import './styles/App.css';
import { AppRouter } from "./providers/router/AppRouter";
import { AppErrorBoundary } from "./providers/AppErrorBoundary";

const App = () => {
  useEffect(() => {
    window.electron.subscribe("message", (data) => {
      console.log(data);
    });
  }, []);

  return (
    <ThemeProvider theme="light">
      <AppErrorBoundary>
        <AppRouter />
      </AppErrorBoundary>
    </ThemeProvider>
  );
};

export default App;
