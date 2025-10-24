import { api } from './api';
import type {
  CreateVehiculoDto,
  UpdateVehiculoDto,
  Vehiculo,
  VehiculoDocumento,
  CreateVehiculoDocumentoDto,
  HistorialVehiculoItem,
  HistorialVehiculoQuery,
} from './types';

// ===== Vehículos =====
export function listVehiculos(): Promise<Vehiculo[]> {
  return api<Vehiculo[]>('/vehiculos');
}
export function createVehiculo(dto: CreateVehiculoDto): Promise<Vehiculo> {
  return api<Vehiculo>('/vehiculos', { method: 'POST', body: JSON.stringify(dto) });
}
export function updateVehiculo(id: string, dto: UpdateVehiculoDto): Promise<Vehiculo> {
  return api<Vehiculo>(`/vehiculos/${id}`, { method: 'PATCH', body: JSON.stringify(dto) });
}
export function deleteVehiculo(id: string): Promise<{ ok: true }> {
  return api<{ ok: true }>(`/vehiculos/${id}`, { method: 'DELETE' });
}

// ===== Documentos de vehículo =====
export function listVehiculoDocumentos(vehiculoId: string): Promise<VehiculoDocumento[]> {
  return api<VehiculoDocumento[]>(`/vehiculos/${vehiculoId}/documentos`);
}
export function createVehiculoDocumento(
  vehiculoId: string,
  dto: CreateVehiculoDocumentoDto
): Promise<VehiculoDocumento> {
  const body = { ...dto, tamano: Number(dto.tamano) };
  return api<VehiculoDocumento>(`/vehiculos/${vehiculoId}/documentos`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}
export function deleteVehiculoDocumento(
  vehiculoId: string,
  documentoId: string
): Promise<{ ok: true }> {
  return api<{ ok: true }>(`/vehiculos/${vehiculoId}/documentos/${documentoId}`, { method: 'DELETE' });
}

// ===== Historial de alquileres por vehículo =====
// Usa el endpoint del backend: GET /alquileres/vehiculo/:vehiculoId/historial
export function listVehiculoHistorial(
  vehiculoId: string,
  query?: HistorialVehiculoQuery
): Promise<HistorialVehiculoItem[]> {
  const params = new URLSearchParams();
  if (query?.estado) params.set('estado', query.estado);
  if (query?.desde) params.set('desde', query.desde);
  if (query?.hasta) params.set('hasta', query.hasta);
  const qs = params.toString();
  const url = `/alquileres/vehiculo/${vehiculoId}/historial${qs ? `?${qs}` : ''}`;
  return api<HistorialVehiculoItem[]>(url);
}

