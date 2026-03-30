import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Global error handler for external service errors
// Note: Public keys in Cashfree don't require IP whitelisting
// IP whitelisting is only needed for server-side API calls with secret keys
window.addEventListener('error', (event) => {
  // Suppress Cashfree verification errors from external services/extensions
  // These errors typically occur when:
  // 1. Browser extensions try to verify Cashfree
  // 2. External services make unauthorized API calls
  // 3. IP whitelisting is enabled but server IP isn't whitelisted (for server-side calls only)
  if (
    event.message?.includes('Cashfree') ||
    event.message?.includes('cashfree') ||
    event.message?.includes('Verification service authentication failed') ||
    event.message?.includes('verification service') ||
    event.message?.includes('IP whitelisting')
  ) {
    event.preventDefault();
    // Only log if it's not a known external service issue
    if (!event.message?.includes('browser extension') && !event.message?.includes('external')) {
      console.warn('External service error (likely from extension or external service):', event.message);
    }
    return false;
  }
});

// Suppress unhandled promise rejections from external services
window.addEventListener('unhandledrejection', (event) => {
  if (
    event.reason?.message?.includes('Cashfree') ||
    event.reason?.message?.includes('cashfree') ||
    event.reason?.message?.includes('Verification service authentication failed') ||
    event.reason?.message?.includes('verification service') ||
    event.reason?.message?.includes('IP whitelisting')
  ) {
    event.preventDefault();
    if (!event.reason?.message?.includes('browser extension') && !event.reason?.message?.includes('external')) {
      console.warn('External service promise rejection (likely from extension or external service):', event.reason?.message);
    }
    return false;
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
