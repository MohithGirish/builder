/*
 * main.jsx — Application entry point.
 *
 * Bootstraps the React application by mounting the root <App /> component
 * into the #root DOM element. Wraps the tree in React.StrictMode to surface
 * potential issues during development.
 */
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
