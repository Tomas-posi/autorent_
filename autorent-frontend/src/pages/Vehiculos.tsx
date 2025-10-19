// src/pages/Vehiculos.tsx
// CRUD de vehículos con búsqueda por placa y manejo de duplicados.
// Incluye "Documentos" (modal) y ahora "Precio por día" manteniendo el mismo diseño oscuro.
import { Link } from 'react-router-dom';

import React, { useEffect, useState } from 'react';
import {
  listVehiculos,
  createVehiculo,
  updateVehiculo,
  deleteVehiculo,
  listVehiculoDocumentos,
  createVehiculoDocumento,
  deleteVehiculoDocumento,
} from '../lib/vehiculos.api';
import type {
  Vehiculo,
  CreateVehiculoDto,
  UpdateVehiculoDto,
  TipoCombustible,
  EstadoVehiculo,
  VehiculoDocumento,
  CreateVehiculoDocumentoDto,
  TipoVehiculoDocumento,
} from '../lib/types';
import { COMBUSTIBLES, ESTADOS, TIPOS_DOCUMENTO_VEHICULO } from '../lib/types';

// formato legible a fecha/hora
function fmt(dt: string) {
  try { return new Date(dt).toLocaleString(); } catch { return dt; }
}
// formato precio (2 decimales)
function fmtPrice(n: number) {
  try { return Number(n ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  catch { return String(n); }
}

// Mensaje claro en errores de duplicado
function friendlyUniqueMessage(raw: string, ctx: { placa?: string; vin?: string }) {
  const m = raw.toLowerCase();
  const placaHit = m.includes('placa') || /key\s*\(\s*placa\s*\)/i.test(raw);
  const vinHit = m.includes('vin') || /key\s*\(\s*vin\s*\)/i.test(raw);
  const isDup =
    m.includes('duplicate') || m.includes('unique') || m.includes('ya existe') || m.includes('violates unique');
  if (!isDup) return raw;
  if (placaHit) return `Ya existe un vehículo con esa placa (${ctx.placa ?? ''}).`;
  if (vinHit) return `Ya existe un vehículo con ese VIN (${ctx.vin ?? ''}).`;
  return 'Ya existe un vehículo con esa placa o ese VIN.';
}

// Valores por defecto del formulario
const defaultForm: CreateVehiculoDto = {
  placa: '',
  marca: '',
  modelo: '',
  anio: new Date().getFullYear(),
  vin: '',
  combustible: undefined,
  estado: 'DISPONIBLE',
  precioPorDia: 0,               // <— nuevo
};

export default function VehiculosPage() {
  const [rows, setRows] = useState<Vehiculo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<CreateVehiculoDto>(defaultForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  // búsqueda por placa
  const [q, setQ] = useState('');

  // ===== Documentos (estado UI) =====
  const [docsOpen, setDocsOpen] = useState(false);
  const [docsVehiculo, setDocsVehiculo] = useState<Vehiculo | null>(null);
  const [docs, setDocs] = useState<VehiculoDocumento[]>([]);
  const [docsLoading, setDocsLoading] = useState(false);
  const [docsError, setDocsError] = useState<string | null>(null);
  const [docForm, setDocForm] = useState<CreateVehiculoDocumentoDto>({
    tipo: undefined, nombreOriginal: '', nombreArchivo: '', mimeType: '', tamano: 0, urlArchivo: '', notas: '',
  });

  useEffect(() => { refresh(); }, []);

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
    if (!form.vin || form.vin.length !== 17) {
      return 'El VIN es obligatorio y debe tener 17 caracteres.';
    }
    if (form.combustible && !COMBUSTIBLES.includes(form.combustible)) {
      return 'Combustible inválido.';
    }
    if (form.estado && !ESTADOS.includes(form.estado)) {
      return 'Estado inválido.';
    }
    // --- precioPorDia: >= 0 y máx 2 decimales
    const p = Number(form.precioPorDia);
    if (Number.isNaN(p) || p < 0) return 'El precio por día debe ser un número mayor o igual a 0.';
    const cents = Math.round(p * 100);
    if (Math.abs(p * 100 - cents) > 1e-6) return 'El precio por día solo puede tener hasta 2 decimales.';
    return null;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const msg = validate();
    if (msg) { alert(msg); return; }

    // normalizamos a 2 decimales por si acaso
    const precioRedondeado = Math.round(Number(form.precioPorDia) * 100) / 100;

    try {
      if (editingId) {
        const payload: UpdateVehiculoDto = { ...form, precioPorDia: precioRedondeado };
        await updateVehiculo(editingId, payload);
        alert('Vehículo actualizado');
      } else {
        const payload: CreateVehiculoDto = { ...form, precioPorDia: precioRedondeado };
        await createVehiculo(payload);
        alert('Vehículo creado');
      }
      setForm(defaultForm);
      setEditingId(null);
      await refresh();
    } catch (e: any) {
      const raw = e?.message ?? 'Error guardando vehículo';
      const pretty = friendlyUniqueMessage(raw, { placa: form.placa, vin: form.vin || '' });
      alert(pretty);
    }
  }

  function startEdit(v: Vehiculo) {
    setEditingId(v.id);
    setForm({
      placa: v.placa,
      marca: v.marca,
      modelo: v.modelo,
      anio: v.anio,
      vin: (v as any).vin ?? '',
      combustible: (v.combustible ?? undefined) as TipoCombustible | undefined,
      estado: v.estado as EstadoVehiculo,
      precioPorDia: Number(v.precioPorDia ?? 0),   // <—
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

  // ===== Documentos (lógica) =====
  function openDocs(v: Vehiculo) {
    setDocsVehiculo(v);
    setDocs([]);
    setDocsError(null);
    setDocForm({ tipo: undefined, nombreOriginal: '', nombreArchivo: '', mimeType: '', tamano: 0, urlArchivo: '', notas: '' });
    setDocsOpen(true);
    loadDocs(v.id);
  }
  async function loadDocs(vehiculoId: string) {
    try { setDocsLoading(true); const list = await listVehiculoDocumentos(vehiculoId); setDocs(list); }
    catch (e: any) { setDocsError(e?.message ?? 'Error cargando documentos'); }
    finally { setDocsLoading(false); }
  }
  function validateDoc(): string | null {
    if (!docForm.nombreOriginal.trim()) return 'El nombre original es obligatorio.';
    if (!docForm.nombreArchivo.trim()) return 'El nombre de archivo es obligatorio.';
    if (!docForm.mimeType.trim()) return 'El mimeType es obligatorio.';
    if (!docForm.urlArchivo.trim()) return 'La URL del archivo es obligatoria.';
    if (Number.isNaN(Number(docForm.tamano)) || Number(docForm.tamano) < 0) return 'El tamaño debe ser un número ≥ 0.';
    if (docForm.tipo && !TIPOS_DOCUMENTO_VEHICULO.includes(docForm.tipo as TipoVehiculoDocumento)) return 'Tipo de documento inválido.';
    return null;
  }
  async function onCreateDoc() {
    if (!docsVehiculo) return;
    const msg = validateDoc(); if (msg) { alert(msg); return; }
    try {
      const created = await createVehiculoDocumento(docsVehiculo.id, { ...docForm, tamano: Number(docForm.tamano) });
      setDocs(prev => [created, ...prev]);
      setDocForm({ tipo: undefined, nombreOriginal: '', nombreArchivo: '', mimeType: '', tamano: 0, urlArchivo: '', notas: '' });
      alert('Documento agregado');
    } catch (e: any) { alert(e?.message ?? 'Error creando documento'); }
  }
  async function onDeleteDoc(id: string) {
    if (!docsVehiculo) return; if (!confirm('¿Eliminar este documento?')) return;
    try { await deleteVehiculoDocumento(docsVehiculo.id, id); setDocs(prev => prev.filter(d => d.id !== id)); alert('Documento eliminado'); }
    catch (e: any) { alert(e?.message ?? 'Error eliminando documento'); }
  }

  const combustibles = COMBUSTIBLES;
  const estados = ESTADOS;

  // Filtra por placa (insensible a mayúsculas)
  const filtered = rows.filter(v => v.placa.toLowerCase().includes(q.trim().toLowerCase()));

  return (
    <div style={styles.wrap}>
      <div style={styles.container}>
        <div style={styles.pageHeader}>
          <Link to="/menu" style={styles.backBtn}>← Volver</Link>
          </div>

        <h1 style={{ margin: 0, fontSize: 22 }}>Vehículos</h1>
        <p style={{ color: '#9ca3af', marginTop: 8 }}>Crea, edita o elimina vehículos. Usa el formulario y la tabla inferior.</p>

        {/* Formulario Crear/Editar */}
        <form onSubmit={onSubmit} style={styles.form}>
          <div style={styles.row}>
            <div style={styles.col}>
              <label style={styles.label}>Placa *</label>
              <input style={styles.input} value={form.placa}
                onChange={e => upd('placa', e.target.value.trim().toUpperCase())}
                placeholder="ABC123" required minLength={5} maxLength={10} />
            </div>
            <div style={styles.col}>
              <label style={styles.label}>Marca *</label>
              <input style={styles.input} value={form.marca}
                onChange={e => upd('marca', e.target.value)} placeholder="Toyota" required />
            </div>
            <div style={styles.col}>
              <label style={styles.label}>Modelo *</label>
              <input style={styles.input} value={form.modelo}
                onChange={e => upd('modelo', e.target.value)} placeholder="Corolla" required />
            </div>
          </div>

          <div style={styles.row}>
            <div style={styles.col}>
              <label style={styles.label}>Año *</label>
              <input type="number" style={styles.input} value={form.anio}
                onChange={e => upd('anio', Number(e.target.value))}
                min={1980} max={new Date().getFullYear() + 1} required />
            </div>
            <div style={styles.col}>
              <label style={styles.label}>VIN (17) obligatorio</label>
              <input style={styles.input} value={form.vin}
                onChange={e => upd('vin', e.target.value.toUpperCase())}
                placeholder="XXXXXXXXXXXXXXXXX" minLength={17} maxLength={17} required />
            </div>
            <div style={styles.col}>
              <label style={styles.label}>Combustible</label>
              <select style={styles.input} value={form.combustible ?? ''}
                onChange={e => upd('combustible', (e.target.value || undefined) as TipoCombustible | undefined)}>
                <option value="">-- Seleccionar --</option>
                {combustibles.map(c => (<option key={c} value={c}>{c}</option>))}
              </select>
            </div>
          </div>

          <div style={styles.row}>
            <div style={styles.col}>
              <label style={styles.label}>Estado</label>
              <select style={styles.input} value={form.estado ?? 'DISPONIBLE'}
                onChange={e => upd('estado', e.target.value as EstadoVehiculo)}>
                {estados.map(s => (<option key={s} value={s}>{s}</option>))}
              </select>
            </div>
            <div style={styles.col}>
              <label style={styles.label}>Precio por día *</label>
              <input
                type="number"
                step="0.01"
                min={0}
                style={styles.input}
                value={form.precioPorDia}
                onChange={e => upd('precioPorDia', Number(e.target.value))}
                placeholder="0.00"
                required
              />
            </div>
            <div style={styles.col} /> {/* columna vacía para mantener la grilla */}
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button type="submit" style={styles.saveBtn}>
              {editingId ? 'Guardar cambios' : 'Crear vehículo'}
            </button>
            {editingId && (
              <button type="button" style={styles.cancelBtn} onClick={cancelEdit}>Cancelar</button>
            )}
          </div>
        </form>

        {/* Listado con búsqueda por placa */}
        <div style={styles.tableWrap}>
          <div style={styles.tableHeader}>
            <span style={{ fontWeight: 700 }}>Listado</span>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input style={{ ...styles.input, width: 220 }} value={q}
                onChange={e => setQ(e.target.value)} placeholder="Buscar por placa (ABC123)" />
              <button style={styles.secondaryBtn} onClick={() => setQ('')} type="button" title="Limpiar búsqueda">Limpiar</button>
              <button style={styles.secondaryBtn} onClick={() => { setEditingId(null); setForm(defaultForm); window.scrollTo({ top: 0, behavior: 'smooth' }); }} type="button">+ Nuevo</button>
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
                    <th style={styles.th}>Placa</th>
                    <th style={styles.th}>VIN</th>
                    <th style={styles.th}>Marca</th>
                    <th style={styles.th}>Modelo</th>
                    <th style={styles.th}>Año</th>
                    <th style={styles.th}>Combustible</th>
                    <th style={styles.th}>Estado</th>
                    <th style={styles.th}>Precio/día</th>  {/* <— nueva col */}
                    <th style={styles.th}>Actualizado</th>
                    <th style={styles.th}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(v => (
                    <tr key={v.id}>
                      <td style={styles.td}>{v.placa}</td>
                      <td style={styles.td}>{(v as any).vin ?? '-'}</td>
                      <td style={styles.td}>{v.marca}</td>
                      <td style={styles.td}>{v.modelo}</td>
                      <td style={styles.td}>{v.anio}</td>
                      <td style={styles.td}>{v.combustible ?? '-'}</td>
                      <td style={styles.td}>{v.estado}</td>
                      <td style={styles.td}>{fmtPrice(v.precioPorDia)}</td> {/* <— valor */}
                      <td style={styles.td}>{fmt(v.actualizadoEn)}</td>
                      <td style={styles.td}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button style={styles.smallBtn} onClick={() => startEdit(v)}>Editar</button>
                          <button style={styles.smallDanger} onClick={() => onDelete(v.id)}>Eliminar</button>
                          <button style={styles.smallBtn} onClick={() => openDocs(v)}>Documentos</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
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

      {/* ========= MODAL DOCUMENTOS ========= */}
      {/* …(SIN CAMBIOS desde tu versión que ya aprobaste)… */}
      {docsOpen && docsVehiculo && (
        <div style={styles.overlay} onClick={() => setDocsOpen(false)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div>
                <h3 style={{ margin: 0 }}>Documentos del vehículo</h3>
                <div style={{ marginTop: 6, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <span style={styles.pill}>Placa: <strong>{docsVehiculo.placa}</strong></span>
                  <span style={styles.pill}>VIN: <strong>{(docsVehiculo as any).vin}</strong></span>
                </div>
              </div>
              <button style={styles.cancelBtn} onClick={() => setDocsOpen(false)}>Cerrar</button>
            </div>

            <div style={styles.docCard}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong>Agregar documento</strong>
                <button type="button" style={styles.secondaryBtn}
                  onClick={() => setDocForm({ tipo: undefined, nombreOriginal: '', nombreArchivo: '', mimeType: '', tamano: 0, urlArchivo: '', notas: '' })}>
                  Limpiar
                </button>
              </div>

              <div style={styles.row}>
                <div style={styles.col}>
                  <label style={styles.label}>Tipo</label>
                  <select style={styles.input} value={docForm.tipo ?? ''}
                    onChange={e => setDocForm(f => ({ ...f, tipo: (e.target.value || undefined) as TipoVehiculoDocumento | undefined }))}>
                    <option value="">-- Seleccionar --</option>
                    {TIPOS_DOCUMENTO_VEHICULO.map(t => (<option key={t} value={t}>{t}</option>))}
                  </select>
                </div>
                <div style={styles.col}>
                  <label style={styles.label}>Nombre original *</label>
                  <input style={styles.input} value={docForm.nombreOriginal}
                    onChange={e => setDocForm(f => ({ ...f, nombreOriginal: e.target.value }))} placeholder="Archivo.pdf" />
                </div>
                <div style={styles.col}>
                  <label style={styles.label}>Nombre archivo *</label>
                  <input style={styles.input} value={docForm.nombreArchivo}
                    onChange={e => setDocForm(f => ({ ...f, nombreArchivo: e.target.value }))} placeholder="uuid-archivo.pdf" />
                </div>
              </div>

              <div style={styles.row}>
                <div style={styles.col}>
                  <label style={styles.label}>MIME *</label>
                  <input style={styles.input} value={docForm.mimeType}
                    onChange={e => setDocForm(f => ({ ...f, mimeType: e.target.value }))} placeholder="application/pdf" />
                </div>
                <div style={styles.col}>
                  <label style={styles.label}>Tamaño (bytes) *</label>
                  <input type="number" style={styles.input} value={docForm.tamano}
                    onChange={e => setDocForm(f => ({ ...f, tamano: Number(e.target.value) }))} placeholder="0" />
                </div >
                <div style={styles.col}>
                  <label style={styles.label}>URL archivo *</label>
                  <input style={styles.input} value={docForm.urlArchivo}
                    onChange={e => setDocForm(f => ({ ...f, urlArchivo: e.target.value }))} placeholder="https://…" />
                </div>
              </div>

              <div style={styles.row}>
                <div style={{ ...styles.col, gridColumn: '1 / -1' }}>
                  <label style={styles.label}>Notas</label>
                  <input style={styles.input} value={docForm.notas ?? ''}
                    onChange={e => setDocForm(f => ({ ...f, notas: e.target.value }))} placeholder="Opcional" />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button type="button" style={styles.saveBtn} onClick={onCreateDoc}>Agregar</button>
                <button type="button" style={styles.cancelBtn}
                  onClick={() => setDocForm({ tipo: undefined, nombreOriginal: '', nombreArchivo: '', mimeType: '', tamano: 0, urlArchivo: '', notas: '' })}>
                  Cancelar
                </button>
              </div>
            </div>

            <div style={styles.tableCard}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <strong>Lista de documentos</strong>
                {docsLoading && <span style={{ color: '#9ca3af', fontSize: 12 }}>Cargando…</span>}
              </div>
              {docsError ? (
                <div style={styles.error}>Error: {docsError}</div>
              ) : (
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Tipo</th>
                      <th style={styles.th}>Nombre</th>
                      <th style={styles.th}>MIME</th>
                      <th style={styles.th}>Tamaño</th>
                      <th style={styles.th}>URL</th>
                      <th style={styles.th}>Notas</th>
                      <th style={styles.th}>Creado</th>
                      <th style={styles.th}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {docs.map(d => (
                      <tr key={d.id}>
                        <td style={styles.td}>{d.tipo ?? '-'}</td>
                        <td style={styles.td}>{d.nombreOriginal}</td>
                        <td style={styles.td}>{d.mimeType}</td>
                        <td style={styles.td}>{String(d.tamano)}</td>
                        <td style={styles.td}><a href={d.urlArchivo} target="_blank" rel="noreferrer">{d.urlArchivo}</a></td>
                        <td style={styles.td}>{d.notas ?? '-'}</td>
                        <td style={styles.td}>{fmt(d.creadoEn)}</td>
                        <td style={styles.td}><button style={styles.smallDanger} onClick={() => onDeleteDoc(d.id)}>Eliminar</button></td>
                      </tr>
                    ))}
                    {docs.length === 0 && (
                      <tr><td colSpan={8} style={{ ...styles.td, textAlign: 'center', color: '#9ca3af' }}>Sin documentos</td></tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/** Estilos iguales */
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

  overlay: { position: 'fixed', top: 0, right: 0, bottom: 0, left: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, zIndex: 50 },
  modal: { width: 'min(1100px, 96vw)', background: '#111827', color: '#e5e7eb', borderRadius: 14, padding: 16, boxShadow: '0 24px 60px rgba(0,0,0,.6)', border: '1px solid #374151', maxHeight: '92vh', overflow: 'auto' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  pill: { fontSize: 12, padding: '4px 8px', borderRadius: 999, background: '#0b1220', border: '1px solid #374151' },
  docCard: { background: '#0b1220', padding: 12, borderRadius: 12, border: '1px solid #374151', marginBottom: 12, display: 'grid', gap: 10 },

  pageHeader: { display: 'flex', justifyContent: 'flex-start', marginBottom: 8 },
  backBtn: { padding: '8px 10px', borderRadius: 10, background: '#1f2937', color: '#e5e7eb', border: '1px solid #374151', fontWeight: 700, textDecoration: 'none' },
  
};
