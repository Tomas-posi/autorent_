import { IsDateString, IsNotEmpty, IsUUID } from 'class-validator';

export class CreateAlquilerDto {
  @IsUUID()
  @IsNotEmpty()
  clienteId: string;

  @IsUUID()
  @IsNotEmpty()
  vehiculoId: string;

  @IsDateString()
  fechaInicio: string;

  @IsDateString()
  fechaFinEstimada: string;
}
