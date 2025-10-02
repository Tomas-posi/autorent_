import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './pages/Auth';
import MenuPage from './pages/Menu';
import AdminRegister from './pages/AdminRegister';
import { useMe } from './lib/useMe';
import { getToken } from './lib/api';
import VehiculosPage from './pages/Vehiculos';

function Protected({ children }: { children: React.ReactElement }) {
  const token = getToken();
  if (!token) return <Navigate to="/auth" replace />;
  return children;
}

function AdminOnly({ children }: { children: React.ReactElement }) {
  const { me, loading } = useMe();
  if (loading) return <div style={{ padding: 20 }}>Cargando…</div>;
  if (!me) return <Navigate to="/auth" replace />;
  if (me.rol !== 'ADMIN') return <Navigate to="/menu" replace />;
  return children;
}

export default function App(): React.ReactElement {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/menu" element={<Protected><MenuPage /></Protected>} />
        <Route path="/vehiculos" element={<Protected><VehiculosPage /></Protected>} />
        <Route
          path="/admin/register"
          element={
            <Protected>
              <AdminOnly>
                <AdminRegister />
              </AdminOnly>
            </Protected>
          }
        />
        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
