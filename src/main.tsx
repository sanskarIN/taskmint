import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { ErrorBoundary } from './components/ErrorBoundary';
import { PwaUpdatePrompt } from './components/PwaUpdatePrompt';
import './styles.css';

const root = document.getElementById('root');
if (!root) throw new Error('TaskMint root element was not found.');

createRoot(root).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
      <PwaUpdatePrompt />
    </ErrorBoundary>
  </StrictMode>
);
