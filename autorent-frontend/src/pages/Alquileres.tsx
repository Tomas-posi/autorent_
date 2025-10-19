// src/pages/Alquileres.tsx
import React from 'react';
import { api } from '../lib/api';
import type { Cliente, Vehiculo, Alquiler } from '../lib/types';
import { listAlquileres, createAlquiler, finalizarAlquiler } from '../lib/alquileres.api';
import { Link } from 'react-router-dom';

// helpers
const money = (n?: number | null) =>
  typeof n === 'number' ? n.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-';
const fmtDate = (iso?: string | null) => (iso ? new Date(iso).toLocaleDateString('es-CO') : '-');
const daysBetween = (a?: string, b?: string) => {
  if (!a || !b) return 0;
  const A = new Date(a).getTime(), B = new Date(b).getTime();
  const d = Math.ceil((B - A) / (1000 * 60 * 60 * 24));
  return d > 0 ? d : 0;
};

export default function AlquileresPage() {
  const [vehiculos, setVehiculos] = React.useState<Vehiculo[]>([]);
  const [clientes, setClientes] = React.useState<Cliente[]>([]);
  const [rows, setRows] = React.useState<Alquiler[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // form
  const [vehiculoId, setVehiculoId] = React.useState('');
  const [clienteId, setClienteId] = React.useState('');
  const [inicio, setInicio] = React.useState('');
  const [finEst, setFinEst] = React.useState('');

  // finalizar inline
  const [finishingId, setFinishingId] = React.useState<string | null>(null);
  const [finReal, setFinReal] = React.useState<string>('');

  const vehiculosDisponibles = React.useMemo(
    () => vehiculos.filter(v => v.estado === 'DISPONIBLE'),
    [vehiculos]
  );

  const vehSel = React.useMemo(
    () => vehiculos.find(v => v.id === vehiculoId),
    [vehiculos, vehiculoId]
  );

  const dias = daysBetween(inicio, finEst);
  const totalEstimadoLocal = dias > 0 ? (vehSel?.precioPorDia ?? 0) * dias : 0;

  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const [vs, cs, rs] = await Promise.all([
          api<Vehiculo[]>('/vehiculos'),
          api<Cliente[]>('/clientes'),
          api<Alquiler[]>('/alquileres'),
        ]);
        if (!alive) return;
        setVehiculos(vs);
        setClientes(cs);
        setRows(rs);
      } catch (e: any) {
        if (!alive) return;
        setError(e?.message ?? 'Error cargando datos');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  async function onCrear(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!vehiculoId || !clienteId || !inicio || !finEst) {
      setError('Completa todos los campos obligatorios.');
      return;
    }
    if (daysBetween(inicio, finEst) <= 0) {
      setError('La fecha de fin estimada debe ser posterior a la fecha de inicio.');
      return;
    }

    try {
      const created = await createAlquiler({
        clienteId,
        vehiculoId,
        fechaInicio: inicio,
        fechaFinEstimada: finEst,
      });
      // prepend
      setRows(prev => [created, ...prev]);
      // el vehículo dejó de estar disponible: refrescar lista de vehículos
      const vs = await api<Vehiculo[]>('/vehiculos');
      setVehiculos(vs);

      // limpiar form
      setVehiculoId(''); setClienteId(''); setInicio(''); setFinEst('');
      alert('Alquiler creado');
    } catch (e: any) {
      setError(e?.message ?? 'No se pudo crear el alquiler');
    }
  }

  function openFinalizar(row: Alquiler) {
    setFinishingId(row.id);
    setFinReal(new Date().toISOString().slice(0, 10)); // YYYY-MM-DD hoy
  }
  function cancelFinalizar() {
    setFinishingId(null);
    setFinReal('');
  }

  async function confirmFinalizar(id: string) {
    if (!finReal) { alert('Selecciona la fecha de fin real'); return; }
    try {
      const updated = await finalizarAlquiler(id, { fechaFinReal: finReal });
      setRows(prev => prev.map(x => (x.id === id ? updated : x)));
      // el vehículo volvió a estar disponible: refrescar
      const vs = await api<Vehiculo[]>('/vehiculos');
      setVehiculos(vs);
      cancelFinalizar();
      alert('Alquiler finalizado');
    } catch (e: any) {
      alert(e?.message ?? 'No se pudo finalizar');
    }
  }

  return (
    <div style={styles.wrap}>
      <div style={styles.container}>
        <div style={styles.pageHeader}>
          <Link to="/menu" style={styles.backBtn}>← Volver</Link>
        </div>

        <h1 style={{ margin: 0, fontSize: 22 }}>Alquileres</h1>
        <p style={{ color: '#9ca3af', marginTop: 8 }}>
          Crea un alquiler con vehículo y cliente existentes. El total final se calcula al finalizar.
        </p>

        {/* Formulario */}
        <form onSubmit={onCrear} style={styles.form}>
          <div style={styles.row}>
            <div style={styles.col}>
              <label style={styles.label}>Vehículo *</label>
              <select
                style={styles.input}
                value={vehiculoId}
                onChange={e => setVehiculoId(e.target.value)}
                required
              >
                <option value="">-- Seleccionar --</option>
                {vehiculosDisponibles.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.placa} — {v.marca} {v.modelo} (${money(v.precioPorDia)})
                  </option>
                ))}
              </select>
            </div>

            <div style={styles.col}>
              <label style={styles.label}>Cliente *</label>
              <select
                style={styles.input}
                value={clienteId}
                onChange={e => setClienteId(e.target.value)}
                required
              >
                <option value="">-- Seleccionar --</option>
                {clientes.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.nombres} {c.apellidos} — {c.tipoDocumento} {c.numeroDocumento}
                  </option>
                ))}
              </select>
            </div>

            <div style={styles.col}>
              <label style={styles.label}>Inicio *</label>
              <input
                type="date"
                style={styles.input}
                value={inicio}
                onChange={e => setInicio(e.target.value)}
                required
              />
            </div>

            <div style={styles.col}>
              <label style={styles.label}>Fin estimada *</label>
              <input
                type="date"
                style={styles.input}
                value={finEst}
                onChange={e => setFinEst(e.target.value)}
                required
              />
            </div>

            <div style={styles.col}>
              <label style={styles.label}>$/día (vehículo)</label>
              <input style={styles.input} readOnly value={vehSel?.precioPorDia ?? ''} />
            </div>

            <div style={styles.col}>
              <label style={styles.label}>Días (estimado)</label>
              <input style={styles.input} readOnly value={dias || ''} />
            </div>

            <div style={styles.col}>
              <label style={styles.label}>Total estimado</label>
              <input style={styles.input} readOnly value={dias ? money(totalEstimadoLocal) : ''} />
            </div>
          </div>

          {error && (
            <div style={styles.error}>{error}</div>
          )}

          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button type="submit" style={styles.saveBtn}>Crear alquiler</button>
            <button type="button" style={styles.cancelBtn} onClick={() => { setVehiculoId(''); setClienteId(''); setInicio(''); setFinEst(''); }}>Limpiar</button>
          </div>
        </form>

        {/* Listado */}
        <div style={styles.tableWrap}>
          <div style={styles.tableHeader}>
            <span style={{ fontWeight: 700 }}>Listado</span>
          </div>

          {loading ? (
            <div style={styles.tableCard}>Cargando...</div>
          ) : (
            <div style={styles.tableCard}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Vehículo</th>
                    <th style={styles.th}>Cliente</th>
                    <th style={styles.th}>Inicio</th>
                    <th style={styles.th}>Fin estimada</th>
                    <th style={styles.th}>Fin real</th>
                    <th style={styles.th}>$/día</th>
                    <th style={styles.th}>Total estimado</th>
                    <th style={styles.th}>Total final</th>
                    <th style={styles.th}>Estado</th>
                    <th style={{ ...styles.th, textAlign: 'right' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map(r => (
                    <tr key={r.id}>
                      <td style={styles.td}>
                        {r.vehiculo?.placa} — {r.vehiculo?.marca} {r.vehiculo?.modelo}
                      </td>
                      <td style={styles.td}>
                        {r.cliente?.nombres} {r.cliente?.apellidos} ({r.cliente?.tipoDocumento} {r.cliente?.numeroDocumento})
                      </td>
                      <td style={styles.td}>{fmtDate(r.fechaInicio)}</td>
                      <td style={styles.td}>{fmtDate(r.fechaFinEstimada)}</td>
                      <td style={styles.td}>{fmtDate(r.fechaFinReal)}</td>
                      <td style={styles.td}>{money(r.precioDiaReservado)}</td>
                      <td style={styles.td}>{money(r.totalEstimado)}</td>
                      <td style={styles.td}>{money(r.totalFinal)}</td>
                      <td style={styles.td}>{r.estado}</td>
                      <td style={{ ...styles.td, textAlign: 'right' }}>
                        {r.estado === 'EN_CURSO' ? (
                          finishingId === r.id ? (
                            <div style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
                              <input
                                type="date"
                                value={finReal}
                                onChange={e => setFinReal(e.target.value)}
                                style={{ ...styles.input, width: 160, height: 36 }}
                                min={r.fechaInicio}
                              />
                              <button style={styles.smallBtn} onClick={() => confirmFinalizar(r.id)}>Guardar</button>
                              <button style={styles.smallDanger} onClick={cancelFinalizar}>Cancelar</button>
                            </div>
                          ) : (
                            <button style={styles.smallBtn} onClick={() => openFinalizar(r)}>Finalizar</button>
                          )
                        ) : (
                          <span style={{ color: '#9ca3af' }}>—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {rows.length === 0 && (
                    <tr>
                      <td colSpan={10} style={{ ...styles.td, textAlign: 'center', color: '#9ca3af' }}>
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
  container: { maxWidth: 1200, margin: '0 auto' },
  form: { marginTop: 16, display: 'grid', gap: 12, background: '#111827', padding: 16, borderRadius: 12, boxShadow: '0 10px 30px rgba(0,0,0,.3)' },
  row: { display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 12 },
  col: { display: 'grid', gap: 6 },
  label: { fontSize: 12, color: '#9ca3af' },
  input: { padding: '10px 12px', borderRadius: 8, border: '1px solid #374151', background: '#0b1220', color: '#e5e7eb' },
  saveBtn: { padding: '10px 12px', borderRadius: 10, background: '#22c55e', color: '#02130a', fontWeight: 700, border: 'none', cursor: 'pointer' },
  cancelBtn: { padding: '10px 12px', borderRadius: 10, background: '#1f2937', color: '#e5e7eb', fontWeight: 700, border: '1px solid #374151', cursor: 'pointer' },

  tableWrap: { marginTop: 20 },
  tableHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  tableCard: { background: '#111827', padding: 8, borderRadius: 12, boxShadow: '0 10px 30px rgba(0,0,0,.3)', overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '10px 8px', borderBottom: '1px solid #374151', fontSize: 12, color: '#9ca3af' },
  td: { padding: '10px 8px', borderBottom: '1px solid #1f2937' },

  smallBtn: { padding: '6px 8px', borderRadius: 8, background: '#22c55e', color: '#071b0f', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700 },
  smallDanger: { padding: '6px 8px', borderRadius: 8, background: '#7f1d1d', color: '#fecaca', border: '1px solid #7f1d1d', cursor: 'pointer', fontSize: 12 },
  error: { background: '#7f1d1d', color: '#fecaca', padding: 8, borderRadius: 8, fontSize: 12 },
  
  pageHeader: { display: 'flex', justifyContent: 'flex-start', marginBottom: 8 },
  backBtn: { padding: '8px 10px', borderRadius: 10, background: '#1f2937', color: '#e5e7eb', border: '1px solid #374151', fontWeight: 700, textDecoration: 'none' },

};
