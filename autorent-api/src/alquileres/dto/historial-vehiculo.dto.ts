import { IsDateString, IsEnum, IsOptional } from 'class-validator';
import { EstadoAlquiler } from '../entities/alquiler.entity';

export class HistorialVehiculoQueryDto {
  @IsOptional()
  @IsEnum(EstadoAlquiler)
  estado?: EstadoAlquiler;

  @IsOptional()
  @IsDateString()
  desde?: string;

  @IsOptional()
  @IsDateString()
  hasta?: string;
}

export interface HistorialVehiculoItemDto {
  id: string;
  estado: EstadoAlquiler;
  fechaInicio: string;
  fechaFinEstimada: string;
  fechaFinReal: string | null;
  totalEstimado: number;
  totalFinal: number | null;
  cliente: {
    id: string;
    nombres: string;
    apellidos: string;
    numeroDocumento: string;
    email: string;
  };
  cancelacion?: {
    fecha: string | null;
    motivo: string | null;
  };
}