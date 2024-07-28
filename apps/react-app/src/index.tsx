import React from "react";
import ReactDOM from "react-dom/client";
import App from "./app/App";
import { BrowserRouter as Router } from "react-router-dom";

const rootEl = document.getElementById("root");
if (rootEl) {
  const root = ReactDOM.createRoot(rootEl);
  root.render(
    <React.StrictMode>
      <Router basename="/">
        <App />
      </Router>
    </React.StrictMode>
  );
}
