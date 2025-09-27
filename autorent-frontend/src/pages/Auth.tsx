import React, { useState } from 'react';
import { api, setToken } from '../lib/api';

type Mode = 'login' | 'register';

export default function AuthPage() {
  const [mode, setMode] = useState<Mode>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [nombres, setNombres] = useState('');
  const [apellidos, setApellidos] = useState('');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (mode === 'register') {
        await api('/empleados/register', {
          method: 'POST',
          body: JSON.stringify({ nombres, apellidos, email, password }),
        });
      }
      const { access_token } = await api<{ access_token: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      setToken(access_token);
      alert('Autenticado ✅');
    } catch (err: any) {
      setError(err.message ?? 'Error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.wrap}>
      <div style={styles.card}>
        <div style={styles.tabs}>
          <button onClick={() => setMode('login')} style={{ ...styles.tab, ...(mode === 'login' ? styles.tabActive : {}) }}>Iniciar sesión</button>
          <button onClick={() => setMode('register')} style={{ ...styles.tab, ...(mode === 'register' ? styles.tabActive : {}) }}>Registrarse</button>
        </div>

        <form onSubmit={onSubmit} style={styles.form}>
          {mode === 'register' && (
            <>
              <label style={styles.label}>Nombres</label>
              <input style={styles.input} value={nombres} onChange={e => setNombres(e.target.value)} required />
              <label style={styles.label}>Apellidos</label>
              <input style={styles.input} value={apellidos} onChange={e => setApellidos(e.target.value)} required />
            </>
          )}

          <label style={styles.label}>Email</label>
          <input type="email" style={styles.input} value={email} onChange={e => setEmail(e.target.value)} required />

          <label style={styles.label}>Contraseña</label>
          <input type="password" style={styles.input} value={password} onChange={e => setPassword(e.target.value)} required minLength={8} />

          {error && <div style={styles.error}>{error}</div>}

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? 'Procesando...' : (mode === 'login' ? 'Entrar' : 'Crear cuenta')}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrap: { minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#0f172a' },
  card: { width: 360, background: '#111827', padding: 24, borderRadius: 16, boxShadow: '0 10px 30px rgba(0,0,0,.3)', color: '#e5e7eb' },
  tabs: { display: 'flex', gap: 8, marginBottom: 16 },
  tab: { flex: 1, padding: '10px 12px', borderRadius: 10, background: '#1f2937', color: '#9ca3af', border: 'none', cursor: 'pointer' },
  tabActive: { background: '#2563eb', color: 'white' },
  form: { display: 'grid', gap: 10 },
  label: { fontSize: 12, color: '#9ca3af' },
  input: { padding: '10px 12px', borderRadius: 8, border: '1px solid #374151', background: '#0b1220', color: '#e5e7eb' },
  button: { marginTop: 8, padding: '10px 12px', borderRadius: 10, background: '#22c55e', color: '#02130a', fontWeight: 700, border: 'none', cursor: 'pointer' },
  error: { background: '#7f1d1d', color: '#fecaca', padding: 8, borderRadius: 8, fontSize: 12 },
};
