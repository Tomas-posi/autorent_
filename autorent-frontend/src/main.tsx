import React from 'react';
import ReactDOM from 'react-dom/client';
import AuthPage from './pages/Auth';
import MenuPage from './pages/Menu';
import VehiculosPage from './pages/Vehiculos';

function Router() {
  const [hash, setHash] = React.useState(window.location.hash || '#/');

  React.useEffect(() => {
    const onHash = () => setHash(window.location.hash || '#/');
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  if (hash.startsWith('#/vehiculos')) return <VehiculosPage />;
  if (hash.startsWith('#/menu')) return <MenuPage />;
  return <AuthPage />;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Router />
  </React.StrictMode>,
);
