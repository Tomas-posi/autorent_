import React from 'react';
import { useMe } from '../lib/useMe';

export default function MenuPage() {
  const { me, loading } = useMe();

  if (loading) return <div style={{ padding: 20 }}>Cargando…</div>;
  if (!me) return <div style={{ padding: 20 }}>Sesión expirada. Vuelve a iniciar sesión.</div>;

  return (
    <div style={styles.wrap}>
      <div style={styles.card}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {me.avatarUrl && (
            <img src={me.avatarUrl} alt="avatar" width={56} height={56} style={{ borderRadius: '50%' }} />
          )}
          <div>
            <h1 style={{ margin: 0, fontSize: 22 }}>Menú</h1>
            <p style={{ color: '#9ca3af', marginTop: 8 }}>
              Hola, <strong>{me.nombres}</strong> — Rol: <strong>{me.rol}</strong>
            </p>
          </div>
        </div>

        <div style={{ marginTop: 16, display: 'grid', gap: 8 }}>
          <a href="#/vehiculos" style={styles.button}>Vehículos</a>
          {me.rol === 'ADMIN' && (
            <a href="#/admin/register" style={{ ...styles.button, background: '#2563eb', color: '#fff' }}>
              Registrar empleado
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrap: { minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#0f172a' },
  card: { width: 420, background: '#111827', padding: 24, borderRadius: 16, boxShadow: '0 10px 30px rgba(0,0,0,.3)', color: '#e5e7eb' },
  button: { padding: '12px 14px', borderRadius: 12, background: '#22c55e', color: '#071b0f', fontWeight: 700, textDecoration: 'none', textAlign: 'center' as const },
};

