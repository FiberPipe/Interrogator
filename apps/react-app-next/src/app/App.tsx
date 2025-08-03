import React from "react";
import { ThemeProvider } from '@gravity-ui/uikit';
import '@gravity-ui/uikit/styles/fonts.css';
import '@gravity-ui/uikit/styles/styles.css';
import './styles/App.css';
import { AppRouter } from "./providers/router/AppRouter";

const App = () => {
  return (
    <React.Fragment>
      <ThemeProvider theme="light">
        <AppRouter />
      </ThemeProvider>
    </React.Fragment>
  );
};

export default App;
