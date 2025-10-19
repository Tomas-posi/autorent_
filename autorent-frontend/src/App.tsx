import React from 'react';
import { HashRouter as Router, Route, Redirect, Switch } from 'react-router-dom';
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
  if (!token) return <Redirect to="/auth" />;
  return children;
}

/** Solo ADMIN */
function AdminOnly({ children }: { children: React.ReactElement }) {
  const { me, loading } = useMe();
  if (loading) return <div style={{ padding: 20 }}>Cargando…</div>;
  if (!me) return <Redirect to="/auth" />;
  if (me.rol !== 'ADMIN') return <Redirect to="/menu" />;
  return children;
}

export default function App(): React.ReactElement {
  return (
    <Router>
      <Switch>
        {/* Auth mantiene su propio layout centrado a pantalla completa */}
        <Route exact path="/auth" component={AuthPage} />

        <Route
          exact
          path="/menu"
          render={() => (
            <Protected>
              <PageContainer>
                <MenuPage />
              </PageContainer>
            </Protected>
          )}
        />

        <Route
          exact
          path="/vehiculos"
          render={() => (
            <Protected>
              <PageContainer>
                <VehiculosPage />
              </PageContainer>
            </Protected>
          )}
        />

        <Route
          exact
          path="/clientes"
          render={() => (
            <Protected>
              <PageContainer>
                <ClientesPage />
              </PageContainer>
            </Protected>
          )}
        />
        <Route
        exact
        path="/alquileres"
         render={() => (
         <Protected>
          <PageContainer>
            <AlquileresPage />
            </PageContainer>
            </Protected>
          )}
        />

        <Route
          exact
          path="/admin/register"
          render={() => (
            <Protected>
              <AdminOnly>
                <PageContainer>
                  <AdminRegister />
                </PageContainer>
              </AdminOnly>
            </Protected>
          )}
        />

        <Redirect to="/auth" />
      </Switch>
    </Router>
  );
}
