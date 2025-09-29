// src/lib/vehiculos.api.ts
// Funciones de acceso a la API de Vehículos.

import { api } from './api';
import type { CreateVehiculoDto, UpdateVehiculoDto, Vehiculo } from './types';

// GET /api/vehiculos
export function listVehiculos(): Promise<Vehiculo[]> {
  return api<Vehiculo[]>('/vehiculos');
}

// GET /api/vehiculos/:id
export function getVehiculo(id: string): Promise<Vehiculo> {
  return api<Vehiculo>(`/vehiculos/${id}`);
}

// POST /api/vehiculos
export function createVehiculo(dto: CreateVehiculoDto): Promise<Vehiculo> {
  return api<Vehiculo>('/vehiculos', {
    method: 'POST',
    body: JSON.stringify(dto),
  });
}

// PATCH /api/vehiculos/:id
export function updateVehiculo(id: string, dto: UpdateVehiculoDto): Promise<Vehiculo> {
  return api<Vehiculo>(`/vehiculos/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(dto),
  });
}

// DELETE /api/vehiculos/:id
export function deleteVehiculo(id: string): Promise<{ ok: true }> {
  return api<{ ok: true }>(`/vehiculos/${id}`, { method: 'DELETE' });
}
