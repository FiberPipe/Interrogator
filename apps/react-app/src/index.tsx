// import React from "react";
// import ReactDOM from "react-dom/client";
// import App from "./app/App";
// import {HashRouter} from "react-router-dom";

// if (typeof window.electron === "undefined") {
//   if (typeof window.electron === "undefined") {
//     window.electron = {
//       send: () => { },
//       subscribe: () => { },
//       getInputs: async () => [],
//       getSensorData: async () => [],
//       insertInput: async () => false,
//     };
//   }
// }

// document.body.style.margin = "0";

// const rootEl = document.getElementById("root");
// if (rootEl) {
//   const root = ReactDOM.createRoot(rootEl);
//   root.render(
//     <React.StrictMode>
//       {/* <HashRouter basename="/">
//         <App />
//       </HashRouter> */}
//       Hello
//     </React.StrictMode>
//   );
// }

import React from "react";
import ReactDOM from "react-dom/client";

function App() {
  return (
    <div style={{ textAlign: "center", marginTop: 50 }}>
      <h1>Hello from React + Electron + Rsbuild 🚀 HOOOOOOORAY!</h1>
      <button onClick={() => (window as any).api?.ping?.()}>
        Ping preload
      </button>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(<App />);

