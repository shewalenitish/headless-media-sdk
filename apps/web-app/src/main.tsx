import React from 'react';
import ReactDOM from 'react-dom/client';
import { MediaProvider } from 'media-react';
import { App } from './App.js';
import './styles.css';

const apiKey = import.meta.env.VITE_PEXELS_API_KEY;

if (!apiKey) {
  // eslint-disable-next-line no-console
  console.error(
    'Missing VITE_PEXELS_API_KEY. Copy apps/web-app/.env.example to apps/web-app/.env and add your Pexels key.'
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <MediaProvider apiKey={apiKey ?? ''}>
      <App />
    </MediaProvider>
  </React.StrictMode>
);
