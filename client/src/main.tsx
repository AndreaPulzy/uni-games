import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/global.css';
import './styles/host.css';
import './styles/play.css';
import { HostApp } from './host/HostApp.tsx';
import { PlayApp } from './play/PlayApp.tsx';
import { Landing } from './ui/Landing.tsx';

function Root() {
  const path = window.location.pathname;
  if (path.startsWith('/host')) return <HostApp />;
  if (path.startsWith('/j/') || path.startsWith('/play')) return <PlayApp />;
  return <Landing />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>
);
