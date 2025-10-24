import { api } from './api';
import type { Alquiler } from './types';

export interface CreateAlquilerDto {
  clienteId: string;
  vehiculoId: string;
  fechaInicio: string;        // YYYY-MM-DD
  fechaFinEstimada: string;   // YYYY-MM-DD
}

export interface FinalizarAlquilerDto {
  fechaFinReal: string;       // YYYY-MM-DD
}

export interface CancelarAlquilerDto {
  fechaCancelacion?: string;  // YYYY-MM-DD (si no va, backend usa hoy)
  motivo: string;             // obligatorio
}

export function listAlquileres(): Promise<Alquiler[]> {
  return api<Alquiler[]>('/alquileres');
}

export function getAlquiler(id: string): Promise<Alquiler> {
  return api<Alquiler>(`/alquileres/${id}`);
}

export function createAlquiler(dto: CreateAlquilerDto): Promise<Alquiler> {
  return api<Alquiler>('/alquileres', {
    method: 'POST',
    body: JSON.stringify(dto),
  });
}

export function finalizarAlquiler(id: string, dto: FinalizarAlquilerDto): Promise<Alquiler> {
  return api<Alquiler>(`/alquileres/${id}/finalizar`, {
    method: 'PATCH',
    body: JSON.stringify(dto),
  });
}

export function cancelarAlquiler(id: string, dto: CancelarAlquilerDto): Promise<Alquiler> {
  return api<Alquiler>(`/alquileres/${id}/cancelar`, {
    method: 'PATCH',
    body: JSON.stringify(dto),
  });
}


