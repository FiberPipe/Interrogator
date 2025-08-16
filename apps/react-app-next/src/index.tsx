import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app/App';
import { FilePaths } from '@app/types/global';

if (typeof window.electron === "undefined") {
  window.electron = {
    send: () => { },
    subscribe: () => { },
    selectFile: () => Promise.resolve(''),
    getSensorsData: (path: string) => Promise.resolve([]),
    setFilePaths: (filePaths: FilePaths) => Promise.resolve({}),
    getFilePaths: () => Promise.resolve({}),
  };
}

const rootEl = document.getElementById('root');
if (rootEl) {
  const root = ReactDOM.createRoot(rootEl);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}
