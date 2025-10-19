// src/lib/clientes.api.ts
import { api } from './api';
import type { Cliente, CreateClienteDto, UpdateClienteDto } from './types';

// ===== Clientes =====
export function listClientes(): Promise<Cliente[]> {
  return api<Cliente[]>('/clientes');
}

export function createCliente(dto: CreateClienteDto): Promise<Cliente> {
  return api<Cliente>('/clientes', { method: 'POST', body: JSON.stringify(dto) });
}

export function updateCliente(id: string, dto: UpdateClienteDto): Promise<Cliente> {
  return api<Cliente>(`/clientes/${id}`, { method: 'PATCH', body: JSON.stringify(dto) });
}

// Tu backend retorna { message: string }, pero aquí no lo usamos; mantenemos la firma simple
export function deleteCliente(id: string): Promise<{ ok: true } | { message: string }> {
  return api<{ ok: true } | { message: string }>(`/clientes/${id}`, { method: 'DELETE' });
}
