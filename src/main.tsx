import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* Global design-system shell: converts every screen to white + navy */}
    <div className="rds-light-shell">
      <App />
    </div>
  </StrictMode>,
);
