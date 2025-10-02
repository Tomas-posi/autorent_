import React from 'react';
import ReactDOM from 'react-dom/client';
import AuthPage from './pages/Auth';
import MenuPage from './pages/Menu';
import VehiculosPage from './pages/Vehiculos';
import AdminRegister from './pages/AdminRegister';
import { getToken } from './lib/api';

function Router() {
  const [hash, setHash] = React.useState(window.location.hash || '#/');

  React.useEffect(() => {
    const onHash = () => setHash(window.location.hash || '#/');
    window.addEventListener('hashchange', onHash);
    if (!window.location.hash) window.location.hash = '#/';
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const needsAuth = (route: string) =>
    route.startsWith('#/menu') ||
    route.startsWith('#/vehiculos') ||
    route.startsWith('#/admin/register');

  if (needsAuth(hash) && !getToken()) {
    window.location.hash = '#/';
    return null;
  }

  if (hash.startsWith('#/vehiculos')) return <VehiculosPage />;
  if (hash.startsWith('#/admin/register')) return <AdminRegister />;
  if (hash.startsWith('#/menu')) return <MenuPage />;
  return <AuthPage />;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Router />
  </React.StrictMode>,
);
