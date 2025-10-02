import React from 'react';
import { api, authHeaders } from '../lib/api'; // usa tu api.ts existente

type Rol = 'ADMIN' | 'EMPLEADO';

interface CreateEmpleadoBody {
  nombres: string;
  apellidos: string;
  email: string;
  password: string;
  rol: Rol;
}

interface CreateEmpleadoResponse {
  id: number;
  nombres: string;
  apellidos: string;
  email: string;
  rol: Rol;
  createdAt?: string;
  updatedAt?: string;
}

export default function AdminRegister() {
  const [nombres, setNombres] = React.useState('');
  const [apellidos, setApellidos] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [rol, setRol] = React.useState<Rol>('EMPLEADO');

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [ok, setOk] = React.useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setOk(null);

    if (!nombres.trim() || !apellidos.trim() || !email.trim() || !password.trim()) {
      setError('Todos los campos marcados con * son obligatorios.');
      return;
    }
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }

    setLoading(true);
    try {
      // OJO: tu api.ts ya añade /api, así que aquí NO ponemos /api al inicio
      const body: CreateEmpleadoBody = { nombres, apellidos, email, password, rol };
      const _res = await api<CreateEmpleadoResponse>('/empleados', {
        method: 'POST',
        headers: {
          ...authHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      setOk('Empleado creado correctamente.');
      setNombres('');
      setApellidos('');
      setEmail('');
      setPassword('');
      setRol('EMPLEADO');
    } catch (err: any) {
      setError(err?.message ?? 'Error creando el empleado.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <h1 style={styles.title}>Registrar empleado</h1>
        <p style={styles.subtitle}>Crea nuevos empleados (solo administradores).</p>
      </header>

      <section style={styles.card}>
        <form onSubmit={onSubmit} style={styles.formGrid as React.CSSProperties}>
          <div style={styles.formItem}>
            <label style={styles.label}>Nombres *</label>
            <input
              style={styles.input as React.CSSProperties}
              value={nombres}
              onChange={(e) => setNombres(e.target.value)}
              placeholder="Ej: Ana María"
            />
          </div>

          <div style={styles.formItem}>
            <label style={styles.label}>Apellidos *</label>
            <input
              style={styles.input as React.CSSProperties}
              value={apellidos}
              onChange={(e) => setApellidos(e.target.value)}
              placeholder="Ej: Pérez Gómez"
            />
          </div>

          <div style={styles.formItem}>
            <label style={styles.label}>Email *</label>
            <input
              type="email"
              style={styles.input as React.CSSProperties}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nombre@empresa.com"
            />
          </div>

          <div style={styles.formItem}>
            <label style={styles.label}>Contraseña * (mín 8)</label>
            <input
              type="password"
              style={styles.input as React.CSSProperties}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
            />
          </div>

          <div style={styles.formItem}>
            <label style={styles.label}>Rol</label>
            <select
              style={styles.select as React.CSSProperties}
              value={rol}
              onChange={(e) => setRol(e.target.value as Rol)}
            >
              <option value="EMPLEADO">EMPLEADO</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            {error && <div style={styles.alertError}>{error}</div>}
            {ok && <div style={styles.alertOk}>{ok}</div>}
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <button type="submit" disabled={loading} style={styles.primaryButton as React.CSSProperties}>
              {loading ? 'Creando...' : 'Crear empleado'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

const styles: Record<string, React.CSSProperties | any> = {
  page: { minHeight: '100vh', padding: '40px 20px', background: '#0f172a', color: '#e5e7eb', display: 'grid', placeItems: 'start center' },
  header: { width: 'min(1180px, 96%)', marginBottom: 18 },
  title: { fontSize: 38, margin: 0, color: '#f3f4f6', fontWeight: 800 },
  subtitle: { margin: '8px 0 0 0', color: '#cbd5e1', fontSize: 16 },
  card: { width: 'min(1180px, 96%)', background: '#0b1220', borderRadius: 18, padding: 24, boxShadow: '0 10px 30px rgba(0,0,0,.35)', border: '1px solid rgba(255,255,255,0.05)' },
  formGrid: { display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 18 },
  formItem: { gridColumn: 'span 6' },
  label: { display: 'block', marginBottom: 8, fontSize: 14, color: '#94a3b8' },
  input: { width: '100%', height: 48, background: '#0f172a', border: '1px solid rgba(255,255,255,.08)', borderRadius: 10, color: '#e5e7eb', padding: '0 14px', outline: 'none' },
  select: { width: '100%', height: 48, background: '#0f172a', border: '1px solid rgba(255,255,255,.08)', borderRadius: 10, color: '#e5e7eb', padding: '0 12px', outline: 'none' },
  primaryButton: { height: 48, background: '#22c55e', border: 'none', color: '#052e16', fontWeight: 800, fontSize: 16, borderRadius: 12, padding: '0 18px', cursor: 'pointer', boxShadow: '0 8px 24px rgba(34,197,94,.25)' },
  alertError: { background: '#7f1d1d', color: '#fee2e2', padding: '10px 12px', borderRadius: 10, marginBottom: 10, border: '1px solid rgba(255,255,255,.08)' },
  alertOk: { background: '#064e3b', color: '#d1fae5', padding: '10px 12px', borderRadius: 10, marginBottom: 10, border: '1px solid rgba(255,255,255,.08)' },
};
