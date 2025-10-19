// src/pages/Clientes.tsx
import React, { useEffect, useState } from 'react';
import { listClientes, createCliente, updateCliente, deleteCliente } from '../lib/clientes.api';
import type { Cliente, CreateClienteDto, UpdateClienteDto, TipoDocumento } from '../lib/types';
import { TIPOS_DOCUMENTO } from '../lib/types';
import { Link } from 'react-router-dom';

// ---- helpers ----
function fmt(dt: string) {
  try { return new Date(dt).toLocaleString(); } catch { return dt; }
}
function emailOk(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}
function friendlyUniqueMessage(raw: string, ctx: { numeroDocumento?: string; email?: string }) {
  const m = String(raw ?? '').toLowerCase();
  const isDup =
    m.includes('duplicate') ||
    m.includes('unique') ||
    m.includes('ya existe') ||
    m.includes('violates unique');
  if (!isDup) return raw;
  if (m.includes('(numero_documento)') || m.includes('documento')) {
    return `El número de documento ya existe${ctx.numeroDocumento ? ` (${ctx.numeroDocumento})` : ''}.`;
  }
  if (m.includes('(email)') || m.includes('email')) {
    return `El email ya existe${ctx.email ? ` (${ctx.email})` : ''}.`;
  }
  return 'El número de documento o email ya existen.';
}

// ---- form default ----
const defaultForm: CreateClienteDto = {
  nombres: '',
  apellidos: '',
  tipoDocumento: 'C.C',
  numeroDocumento: '',
  email: '',
  telefono: '',
  direccion: '',
};

export default function ClientesPage() {
  const [rows, setRows] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<CreateClienteDto>(defaultForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [q, setQ] = useState(''); // buscar por documento

  useEffect(() => { refresh(); }, []);

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const data = await listClientes();
      setRows(data);
    } catch (e: any) {
      setError(e?.message ?? 'Error cargando clientes');
    } finally {
      setLoading(false);
    }
  }

  function upd<K extends keyof CreateClienteDto>(k: K, v: CreateClienteDto[K]) {
    setForm(prev => ({ ...prev, [k]: v }));
  }

  function validate(): string | null {
    if (!form.nombres.trim()) return 'Los nombres son obligatorios.';
    if (!form.apellidos.trim()) return 'Los apellidos son obligatorios.';
    if (!TIPOS_DOCUMENTO.includes(form.tipoDocumento as TipoDocumento)) return 'Tipo de documento inválido.';
    if (!form.numeroDocumento || form.numeroDocumento.length < 4 || form.numeroDocumento.length > 30) {
      return 'El número de documento debe tener entre 4 y 30 caracteres.';
    }
    if (!emailOk(form.email) || form.email.length > 160) return 'Email inválido.';
    if (!form.telefono || form.telefono.length < 5 || form.telefono.length > 30) {
      return 'El teléfono debe tener entre 5 y 30 caracteres.';
    }
    if (form.direccion && form.direccion.length > 200) return 'La dirección no puede superar 200 caracteres.';
    return null;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const msg = validate();
    if (msg) { alert(msg); return; }
    try {
      if (editingId) {
        const payload: UpdateClienteDto = { ...form };
        await updateCliente(editingId, payload);
        alert('Cliente actualizado');
      } else {
        await createCliente(form);
        alert('Cliente creado');
      }
      setForm(defaultForm);
      setEditingId(null);
      await refresh();
    } catch (e: any) {
      const pretty = friendlyUniqueMessage(e?.message ?? 'Error guardando cliente', {
        numeroDocumento: form.numeroDocumento,
        email: form.email,
      });
      alert(pretty);
    }
  }

  function startEdit(c: Cliente) {
    setEditingId(c.id);
    setForm({
      nombres: c.nombres,
      apellidos: c.apellidos,
      tipoDocumento: c.tipoDocumento,
      numeroDocumento: c.numeroDocumento,
      email: c.email,
      telefono: c.telefono,
      direccion: c.direccion ?? '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(defaultForm);
  }

  async function onDelete(id: string) {
    if (!confirm('¿Eliminar este cliente?')) return;
    try {
      await deleteCliente(id);
      await refresh();
      alert('Cliente eliminado');
    } catch (e: any) {
      alert(e?.message ?? 'Error eliminando cliente');
    }
  }

  const filtered = rows.filter(c =>
    c.numeroDocumento.toLowerCase().includes(q.trim().toLowerCase()),
  );

  return (
    <div style={styles.wrap}>
      <div style={styles.container}>
        <div style={styles.pageHeader}>
          <Link to="/menu" style={styles.backBtn}>← Volver</Link>
          </div>
        <h1 style={{ margin: 0, fontSize: 22 }}>Clientes</h1>
        <p style={{ color: '#9ca3af', marginTop: 8 }}>
          Crea, edita o elimina clientes. Usa el formulario y la tabla inferior.
        </p>

        {/* Formulario */}
        <form onSubmit={onSubmit} style={styles.form}>
          <div style={styles.row}>
            <div style={styles.col}>
              <label style={styles.label}>Nombres *</label>
              <input
                style={styles.input}
                value={form.nombres}
                onChange={e => upd('nombres', e.target.value)}
                placeholder="Juan Sebastián"
                required
              />
            </div>
            <div style={styles.col}>
              <label style={styles.label}>Apellidos *</label>
              <input
                style={styles.input}
                value={form.apellidos}
                onChange={e => upd('apellidos', e.target.value)}
                placeholder="Pérez Gómez"
                required
              />
            </div>
            <div style={styles.col}>
              <label style={styles.label}>Tipo documento *</label>
              <select
                style={styles.input}
                value={form.tipoDocumento}
                onChange={e => upd('tipoDocumento', e.target.value as TipoDocumento)}
              >
                {TIPOS_DOCUMENTO.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={styles.row}>
            <div style={styles.col}>
              <label style={styles.label}>Número documento *</label>
              <input
                style={styles.input}
                value={form.numeroDocumento}
                onChange={e => upd('numeroDocumento', e.target.value.trim())}
                placeholder="1030…"
                required
                minLength={4}
                maxLength={30}
              />
            </div>
            <div style={styles.col}>
              <label style={styles.label}>Email *</label>
              <input
                type="email"
                style={styles.input}
                value={form.email}
                onChange={e => upd('email', e.target.value.trim())}
                placeholder="usuario@correo.com"
                required
              />
            </div>
            <div style={styles.col}>
              <label style={styles.label}>Teléfono *</label>
              <input
                style={styles.input}
                value={form.telefono}
                onChange={e => upd('telefono', e.target.value.trim())}
                placeholder="+57 3xx xxx xxxx"
                required
              />
            </div>
          </div>

          <div style={styles.row}>
            <div style={{ ...styles.col, gridColumn: '1 / -1' }}>
              <label style={styles.label}>Dirección (opcional)</label>
              <input
                style={styles.input}
                value={form.direccion ?? ''}
                onChange={e => upd('direccion', e.target.value)}
                placeholder="Calle 123 #45-67, Medellín"
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button type="submit" style={styles.saveBtn}>
              {editingId ? 'Guardar cambios' : 'Crear cliente'}
            </button>
            {editingId && (
              <button type="button" style={styles.cancelBtn} onClick={cancelEdit}>
                Cancelar
              </button>
            )}
          </div>
        </form>

        {/* Tabla + búsqueda */}
        <div style={styles.tableWrap}>
          <div style={styles.tableHeader}>
            <span style={{ fontWeight: 700 }}>Listado</span>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                style={{ ...styles.input, width: 260 }}
                value={q}
                onChange={e => setQ(e.target.value)}
                placeholder="Buscar por documento"
              />
              <button style={styles.secondaryBtn} onClick={() => setQ('')} type="button">Limpiar</button>
              <button
                style={styles.secondaryBtn}
                type="button"
                onClick={() => { setEditingId(null); setForm(defaultForm); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              >
                + Nuevo
              </button>
            </div>
          </div>

          {loading ? (
            <div style={styles.tableCard}>Cargando...</div>
          ) : error ? (
            <div style={styles.error}>Error: {error}</div>
          ) : (
            <div style={styles.tableCard}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Documento</th>
                    <th style={styles.th}>Nombres</th>
                    <th style={styles.th}>Email</th>
                    <th style={styles.th}>Teléfono</th>
                    <th style={styles.th}>Dirección</th>
                    <th style={styles.th}>Actualizado</th>
                    <th style={styles.th}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(c => (
                    <tr key={c.id}>
                      <td style={styles.td}>{c.tipoDocumento} {c.numeroDocumento}</td>
                      <td style={styles.td}>{c.nombres} {c.apellidos}</td>
                      <td style={styles.td}>{c.email}</td>
                      <td style={styles.td}>{c.telefono}</td>
                      <td style={styles.td}>{c.direccion ?? '-'}</td>
                      <td style={styles.td}>{fmt(c.actualizadoEn)}</td>
                      <td style={styles.td}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button style={styles.smallBtn} onClick={() => startEdit(c)}>Editar</button>
                          <button style={styles.smallDanger} onClick={() => onDelete(c.id)}>Eliminar</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={7} style={{ ...styles.td, textAlign: 'center', color: '#9ca3af' }}>Sin registros</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrap: { minHeight: '100vh', padding: 24, background: '#0f172a', color: '#e5e7eb' },
  container: { maxWidth: 1000, margin: '0 auto' },
  form: { marginTop: 16, display: 'grid', gap: 12, background: '#111827', padding: 16, borderRadius: 12, boxShadow: '0 10px 30px rgba(0,0,0,.3)' },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 },
  col: { display: 'grid', gap: 6 },
  label: { fontSize: 12, color: '#9ca3af' },
  input: { padding: '10px 12px', borderRadius: 8, border: '1px solid #374151', background: '#0b1220', color: '#e5e7eb' },
  saveBtn: { padding: '10px 12px', borderRadius: 10, background: '#22c55e', color: '#02130a', fontWeight: 700, border: 'none', cursor: 'pointer' },
  cancelBtn: { padding: '10px 12px', borderRadius: 10, background: '#1f2937', color: '#e5e7eb', fontWeight: 700, border: '1px solid #374151', cursor: 'pointer' },

  tableWrap: { marginTop: 20 },
  tableHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  secondaryBtn: { padding: '8px 10px', borderRadius: 8, background: '#2563eb', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 700 },

  tableCard: { background: '#111827', padding: 8, borderRadius: 12, boxShadow: '0 10px 30px rgba(0,0,0,.3)', overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '10px 8px', borderBottom: '1px solid #374151', fontSize: 12, color: '#9ca3af' },
  td: { padding: '10px 8px', borderBottom: '1px solid #1f2937' },
  smallBtn: { padding: '6px 8px', borderRadius: 8, background: '#1f2937', color: '#e5e7eb', border: '1px solid #374151', cursor: 'pointer', fontSize: 12 },
  smallDanger: { padding: '6px 8px', borderRadius: 8, background: '#7f1d1d', color: '#fecaca', border: '1px solid #7f1d1d', cursor: 'pointer', fontSize: 12 },
  error: { background: '#7f1d1d', color: '#fecaca', padding: 8, borderRadius: 8, fontSize: 12 },

  pageHeader: { display: 'flex', justifyContent: 'flex-start', marginBottom: 8 },
  backBtn: { padding: '8px 10px', borderRadius: 10, background: '#1f2937', color: '#e5e7eb', border: '1px solid #374151', fontWeight: 700, textDecoration: 'none' },

};
