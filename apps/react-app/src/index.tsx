import React from "react";
import ReactDOM from "react-dom/client";
import App from "./app/App";
import { BrowserRouter as Router } from "react-router-dom";

if (typeof window.electron === "undefined") {
  window.electron = {
    send: ()=> {},
    subscribe: ()=> {}
  };
}

document.body.style.margin = "0";

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
