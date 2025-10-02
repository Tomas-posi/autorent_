import React from 'react';
import { api, setToken } from '../lib/api'; // tu api.ts existente

interface LoginResponse {
  access_token: string;
}

export default function AuthPage() {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      // OJO: NO uses /api aquí; tu wrapper ya lo pone
      const data = await api<LoginResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      setToken(data.access_token);
      window.location.hash = '#/menu';
    } catch (err: any) {
      setError(err?.message ?? 'Error de autenticación');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#0f172a', color: '#e5e7eb' }}>
      <form onSubmit={onSubmit} style={{ width: 420, background: '#0b1220', padding: 24, borderRadius: 16, border: '1px solid rgba(255,255,255,.08)' }}>
        <h1 style={{ marginTop: 0 }}>Iniciar sesión</h1>

        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: '100%', height: 44, marginBottom: 12 }}
        />

        <label>Contraseña</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: '100%', height: 44, marginBottom: 12 }}
        />

        {error && <div style={{ background: '#7f1d1d', padding: 10, borderRadius: 8, marginBottom: 10 }}>{error}</div>}

        <button type="submit" disabled={loading} style={{ height: 44, width: '100%', borderRadius: 10, background: '#22c55e', color: '#052e16', fontWeight: 800 }}>
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </div>
  );
}

