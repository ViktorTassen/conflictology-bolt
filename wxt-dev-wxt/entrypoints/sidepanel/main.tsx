import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
// Import Fontsource packages
import '@fontsource/bebas-neue';
import '@fontsource-variable/inter';
import '@fontsource-variable/league-spartan';
import './style.css';

createRoot(document.getElementById('app')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
