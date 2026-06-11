import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import '../styles/globals.css';
import App from './App.tsx';

registerSW({ immediate: true });

// Ask the browser not to evict IndexedDB under storage pressure — all
// progress lives on this device. Safe to call on every launch.
if (typeof navigator !== 'undefined' && navigator.storage?.persist) {
  void navigator.storage.persist();
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
