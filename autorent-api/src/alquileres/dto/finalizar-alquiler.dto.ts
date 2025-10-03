import { IsDateString } from 'class-validator';

export class FinalizarAlquilerDto {
  @IsDateString()
  fechaFinReal: string;
}
