
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { registerSW } from './pwa/registerSW';

// Register service worker for PWA functionality
registerSW();

createRoot(document.getElementById("root")!).render(<App />);
