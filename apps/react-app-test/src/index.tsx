import React from "react";
import ReactDOM from "react-dom/client";
import App from "./app/App";
import {HashRouter} from "react-router-dom";

if (typeof window.electron === "undefined") {
  if (typeof window.electron === "undefined") {
    window.electron = {
      send: () => { },
      //@ts-expect-error
      subscribe: () => { },
      //@ts-expect-error
      getInputs: async () => [],
      getSensorData: async () => [],
      
//@ts-expect-error
      insertInput: async () => false,
    };
  }
}

document.body.style.margin = "0";

const rootEl = document.getElementById("root");
if (rootEl) {
  const root = ReactDOM.createRoot(rootEl);
  root.render(
    <React.StrictMode>
      <HashRouter basename="/">
        <App />
      </HashRouter>
    </React.StrictMode>
  );
}

