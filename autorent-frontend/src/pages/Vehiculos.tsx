// src/pages/Vehiculos.tsx
// Página con listado, formulario de crear/editar y eliminar con confirmación.

import React, { useEffect, useState } from 'react';
import { listVehiculos, createVehiculo, updateVehiculo, deleteVehiculo } from '../lib/vehiculos.api';
import type {
  Vehiculo,
  CreateVehiculoDto,
  UpdateVehiculoDto,
  TipoCombustible,
  EstadoVehiculo,
} from '../lib/types';
import { COMBUSTIBLES, ESTADOS } from '../lib/types';

// Formatea fechas ISO a un formato legible
function fmt(dt: string) {
  try { return new Date(dt).toLocaleString(); } catch { return dt; }
}

// Valores por defecto del formulario (crear)
const defaultForm: CreateVehiculoDto = {
  placa: '',
  marca: '',
  modelo: '',
  anio: new Date().getFullYear(),
  vin: '',
  combustible: undefined,
  estado: 'DISPONIBLE',
};

export default function VehiculosPage() {
  const [rows, setRows] = useState<Vehiculo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<CreateVehiculoDto>(defaultForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    refresh();
  }, []);

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const data = await listVehiculos();
      setRows(data);
    } catch (e: any) {
      setError(e?.message ?? 'Error cargando vehículos');
    } finally {
      setLoading(false);
    }
  }

  function upd<K extends keyof CreateVehiculoDto>(k: K, v: CreateVehiculoDto[K]) {
    setForm(prev => ({ ...prev, [k]: v }));
  }

  function validate(): string | null {
    const year = new Date().getFullYear();
    if (!form.placa || form.placa.length < 5 || form.placa.length > 10) {
      return 'La placa debe tener entre 5 y 10 caracteres.';
    }
    if (!form.marca) return 'La marca es obligatoria.';
    if (!form.modelo) return 'El modelo es obligatorio.';
    if (!Number.isInteger(form.anio) || form.anio < 1980 || form.anio > year + 1) {
      return `El año debe ser un entero entre 1980 y ${year + 1}.`;
    }
    if (form.vin && form.vin.length !== 17) {
      return 'El VIN (si se ingresa) debe tener exactamente 17 caracteres.';
    }
    if (form.combustible && !COMBUSTIBLES.includes(form.combustible)) {
      return 'Combustible inválido.';
    }
    if (form.estado && !ESTADOS.includes(form.estado)) {
      return 'Estado inválido.';
    }
    return null;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const msg = validate();
    if (msg) { alert(msg); return; }

    try {
      if (editingId) {
        const payload: UpdateVehiculoDto = { ...form };
        await updateVehiculo(editingId, payload);
        alert('Vehículo actualizado');
      } else {
        await createVehiculo(form);
        alert('Vehículo creado');
      }
      setForm(defaultForm);
      setEditingId(null);
      await refresh();
    } catch (e: any) {
      alert(e?.message ?? 'Error guardando vehículo');
    }
  }

  function startEdit(v: Vehiculo) {
    setEditingId(v.id);
    setForm({
      placa: v.placa,
      marca: v.marca,
      modelo: v.modelo,
      anio: v.anio,
      vin: v.vin ?? '',
      combustible: (v.combustible ?? undefined) as TipoCombustible | undefined,
      estado: v.estado as EstadoVehiculo,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(defaultForm);
  }

  async function onDelete(id: string) {
    if (!confirm('¿Eliminar este vehículo?')) return;
    try {
      await deleteVehiculo(id);
      await refresh();
      alert('Vehículo eliminado');
    } catch (e: any) {
      alert(e?.message ?? 'Error eliminando vehículo');
    }
  }

  const combustibles = COMBUSTIBLES;
  const estados = ESTADOS;

  return (
    <div style={styles.wrap}>
      <div style={styles.container}>
        <h1 style={{ margin: 0, fontSize: 22 }}>Vehículos</h1>
        <p style={{ color: '#9ca3af', marginTop: 8 }}>
          Crea, edita o elimina vehículos. Usa el formulario y la tabla inferior.
        </p>

        {/* Formulario Crear/Editar */}
        <form onSubmit={onSubmit} style={styles.form}>
          <div style={styles.row}>
            <div style={styles.col}>
              <label style={styles.label}>Placa *</label>
              <input
                style={styles.input}
                value={form.placa}
                onChange={e => upd('placa', e.target.value.trim().toUpperCase())}
                placeholder="ABC123"
                required
                minLength={5}
                maxLength={10}
              />
            </div>
            <div style={styles.col}>
              <label style={styles.label}>Marca *</label>
              <input
                style={styles.input}
                value={form.marca}
                onChange={e => upd('marca', e.target.value)}
                placeholder="Toyota"
                required
              />
            </div>
            <div style={styles.col}>
              <label style={styles.label}>Modelo *</label>
              <input
                style={styles.input}
                value={form.modelo}
                onChange={e => upd('modelo', e.target.value)}
                placeholder="Corolla"
                required
              />
            </div>
          </div>

          <div style={styles.row}>
            <div style={styles.col}>
              <label style={styles.label}>Año *</label>
              <input
                type="number"
                style={styles.input}
                value={form.anio}
                onChange={e => upd('anio', Number(e.target.value))}
                min={1980}
                max={new Date().getFullYear() + 1}
                required
              />
            </div>
            <div style={styles.col}>
              <label style={styles.label}>VIN (17) *</label>
              <input
                style={styles.input}
                value={form.vin}
                onChange={e => upd('vin', e.target.value.toUpperCase())}
                placeholder="XXXXXXXXXXXXXXXXX"
                maxLength={17}
              />
            </div>
            <div style={styles.col}>
              <label style={styles.label}>Combustible</label>
              <select
                style={styles.input}
                value={form.combustible ?? ''}
                onChange={e =>
                  upd('combustible', (e.target.value || undefined) as TipoCombustible | undefined)
                }
              >
                <option value="">-- Seleccionar --</option>
                {combustibles.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={styles.row}>
            <div style={styles.col}>
              <label style={styles.label}>Estado</label>
              <select
                style={styles.input}
                value={form.estado ?? 'DISPONIBLE'}
                onChange={e => upd('estado', e.target.value as EstadoVehiculo)}
              >
                {estados.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button type="submit" style={styles.saveBtn}>
              {editingId ? 'Guardar cambios' : 'Crear vehículo'}
            </button>
            {editingId && (
              <button type="button" style={styles.cancelBtn} onClick={cancelEdit}>
                Cancelar
              </button>
            )}
          </div>
        </form>

        {/* Tabla de listado */}
        <div style={styles.tableWrap}>
          <div style={styles.tableHeader}>
            <span style={{ fontWeight: 700 }}>Listado</span>
            <button
              style={styles.secondaryBtn}
              onClick={() => { setEditingId(null); setForm(defaultForm); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            >
              + Nuevo
            </button>
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
                    <th style={styles.th}>Placa</th>
                    <th style={styles.th}>Marca</th>
                    <th style={styles.th}>Modelo</th>
                    <th style={styles.th}>Año</th>
                    <th style={styles.th}>Combustible</th>
                    <th style={styles.th}>Estado</th>
                    <th style={styles.th}>Actualizado</th>
                    <th style={styles.th}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map(v => (
                    <tr key={v.id}>
                      <td style={styles.td}>{v.placa}</td>
                      <td style={styles.td}>{v.marca}</td>
                      <td style={styles.td}>{v.modelo}</td>
                      <td style={styles.td}>{v.anio}</td>
                      <td style={styles.td}>{v.combustible ?? '-'}</td>
                      <td style={styles.td}>{v.estado}</td>
                      <td style={styles.td}>{fmt(v.actualizadoEn)}</td>
                      <td style={styles.td}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button style={styles.smallBtn} onClick={() => startEdit(v)}>Editar</button>
                          <button style={styles.smallDanger} onClick={() => onDelete(v.id)}>Eliminar</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {rows.length === 0 && (
                    <tr>
                      <td colSpan={8} style={{ ...styles.td, textAlign: 'center', color: '#9ca3af' }}>
                        Sin registros
                      </td>
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
};
