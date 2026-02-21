import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Fix for "Cannot set property fetch of #<Window> which has only a getter"
// This can happen when some libraries try to polyfill fetch in the browser.
if (typeof window !== 'undefined') {
  const originalFetch = window.fetch;
  try {
    Object.defineProperty(window, 'fetch', {
      configurable: true,
      enumerable: true,
      get: () => originalFetch,
      set: (v) => {
        console.warn('Something tried to overwrite window.fetch. Ignoring.', v);
      }
    });
  } catch (e) {
    // If we can't redefine it, it might already be protected or we are in an environment that doesn't allow it.
    console.debug('Could not redefine window.fetch, skipping safeguard.');
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
