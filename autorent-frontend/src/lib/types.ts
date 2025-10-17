// src/lib/types.ts

// ===== VEHÍCULOS =====
export const COMBUSTIBLES = [
  'GASOLINA',
  'DIESEL',
  'HIBRIDO',
  'ELECTRICO',
] as const;
export type TipoCombustible = typeof COMBUSTIBLES[number];

export const ESTADOS = [
  'DISPONIBLE',
  'NO_DISPONIBLE',
  'EN_MANTENIMIENTO',
  'DE_BAJA',
] as const;
export type EstadoVehiculo = typeof ESTADOS[number];

export interface Vehiculo {
  id: string;
  placa: string;
  marca: string;
  modelo: string;
  anio: number;
  vin?: string | null;
  combustible?: TipoCombustible | null;
  estado: EstadoVehiculo;
  precioPorDia: number;           // <— ahora requerido en el front
  creadoEn: string;
  actualizadoEn: string;
}

export interface CreateVehiculoDto {
  placa: string;
  marca: string;
  modelo: string;
  anio: number;
  vin?: string;
  combustible?: TipoCombustible;
  estado?: EstadoVehiculo;
  precioPorDia: number;           // <— nuevo campo
}

export type UpdateVehiculoDto = Partial<CreateVehiculoDto>;

// ===== DOCUMENTOS DE VEHÍCULO =====
export const TIPOS_DOCUMENTO_VEHICULO = [
  'SOAT',
  'TECNOMECANICA',
  'TARJETA_PROPIEDAD',
  'POLIZA',
] as const;
export type TipoVehiculoDocumento = typeof TIPOS_DOCUMENTO_VEHICULO[number];

export interface VehiculoDocumento {
  id: string;
  tipo: TipoVehiculoDocumento | null;
  nombreOriginal: string;
  nombreArchivo: string;
  mimeType: string;
  tamano: number | string;
  urlArchivo: string;
  notas?: string | null;
  creadoEn: string;
  actualizadoEn: string;
}

export interface CreateVehiculoDocumentoDto {
  tipo?: TipoVehiculoDocumento;
  nombreOriginal: string;
  nombreArchivo: string;
  mimeType: string;
  tamano: number;
  urlArchivo: string;
  notas?: string;
}
