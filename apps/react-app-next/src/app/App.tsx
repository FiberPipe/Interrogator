import { useEffect, useState } from "react";
import { ThemeProvider as UIKitThemeProvider } from "@gravity-ui/uikit";
import "@gravity-ui/uikit/styles/fonts.css";
import "@gravity-ui/uikit/styles/styles.css";
import "./styles/App.css";

import { AppRouter } from "./providers/router/AppRouter";
import { AppErrorBoundary } from "./providers/AppErrorBoundary";

import { I18nextProvider } from "react-i18next";
import { initI18n } from "@shared/utils/i18n";

const App = () => {
  const [ready, setReady] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [i18n, setI18n] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const settings = await window.electron.getUserSettings();

      const i18nInstance = await initI18n(settings.language);
      setI18n(i18nInstance);

      setTheme(settings.theme);

      setReady(true);
    })();

    window.electron.subscribe("message", (data) => {
      console.log("[Message from main]:", data);
    });
  }, []);

  if (!ready) {
    return <div>Loading…</div>;
  }

  console.log(i18n, theme, 333)

  return (
    <I18nextProvider i18n={i18n}>
      <UIKitThemeProvider theme={theme}>
        <AppErrorBoundary>
          <AppRouter />
        </AppErrorBoundary>
      </UIKitThemeProvider>
    </I18nextProvider>
  );
};

export default App;
