// src/lib/types.ts
// Tipos alineados con el backend de Vehículos sin usar `enum`.
// Se usan uniones de literales y arrays const para selects y validación.

// Lista de combustibles para selects y validación
export const COMBUSTIBLES = [
  'GASOLINA',
  'DIESEL',
  'HIBRIDO',
  'ELECTRICO',
] as const;
export type TipoCombustible = typeof COMBUSTIBLES[number];

// Lista de estados para selects y validación
export const ESTADOS = [
  'DISPONIBLE',
  'NO_DISPONIBLE',
  'EN_MANTENIMIENTO',
  'DE_BAJA',
] as const;
export type EstadoVehiculo = typeof ESTADOS[number];

// Estructura que devuelve el backend para un vehículo
export interface Vehiculo {
  id: string;
  placa: string;
  marca: string;
  modelo: string;
  anio: number;
  vin?: string | null;
  combustible?: TipoCombustible | null;
  estado: EstadoVehiculo;
  creadoEn: string;      // ISO string
  actualizadoEn: string; // ISO string
}

// DTOs que enviamos al backend en crear/editar
export interface CreateVehiculoDto {
  placa: string;
  marca: string;
  modelo: string;
  anio: number;
  vin?: string;
  combustible?: TipoCombustible;
  estado?: EstadoVehiculo;
}

export type UpdateVehiculoDto = Partial<CreateVehiculoDto>;
