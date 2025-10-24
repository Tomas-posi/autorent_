import React from 'react';
import { HashRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import AuthPage from './pages/Auth';
import MenuPage from './pages/Menu';
import AdminRegister from './pages/AdminRegister';
import VehiculosPage from './pages/Vehiculos';
import ClientesPage from './pages/Clientes';
import { useMe } from './lib/useMe';
import { getToken } from './lib/api';
import AlquileresPage from './pages/Alquileres';

/** Contenedor común: centra horizontal y mantiene el fondo */
function PageContainer({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        display: 'grid',
        /* top + centrado horizontal para que el contenido no quede “pegado” al techo si es alto */
        placeItems: 'start center',
        background: '#0f172a',        // hace match con index.css
        padding: '24px',              // respiración en todos los lados
      }}
    >
      <div style={{ width: '100%', maxWidth: 1200 }}>{children}</div>
    </div>
  );
}

/** Rutas protegidas por token */
function Protected({ children }: { children: React.ReactElement }) {
  const token = getToken();
  if (!token) return <Navigate to="/auth" replace />;
  return children;
}

/** Solo ADMIN */
function AdminOnly({ children }: { children: React.ReactElement }) {
  const { me, loading } = useMe();
  if (loading) return <div style={{ padding: 20 }}>Cargando…</div>;
  if (!me) return <Navigate to="/auth" replace />;
  if (me.rol !== 'ADMIN') return <Navigate to="/menu" replace />;
  return children;
}

export default function App(): React.ReactElement {
  return (
    <Router>
      <Routes>
        {/* Auth mantiene su propio layout centrado a pantalla completa */}
        <Route path="/auth" element={<AuthPage />} />

        <Route
          path="/menu"
          element={
            <Protected>
              <PageContainer>
                <MenuPage />
              </PageContainer>
            </Protected>
          }
        />

        <Route
          path="/vehiculos"
          element={
            <Protected>
              <PageContainer>
                <VehiculosPage />
              </PageContainer>
            </Protected>
          }
        />

        <Route
          path="/clientes"
          element={
            <Protected>
              <PageContainer>
                <ClientesPage />
              </PageContainer>
            </Protected>
          }
        />

        <Route
          path="/alquileres"
          element={
            <Protected>
              <PageContainer>
                <AlquileresPage />
              </PageContainer>
            </Protected>
          }
        />

        <Route
          path="/admin/register"
          element={
            <Protected>
              <AdminOnly>
                <PageContainer>
                  <AdminRegister />
                </PageContainer>
              </AdminOnly>
            </Protected>
          }
        />

        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>
    </Router>
  );
}
