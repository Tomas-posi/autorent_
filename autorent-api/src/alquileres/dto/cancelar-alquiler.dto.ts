import { IsDateString, IsOptional, IsString, MaxLength } from 'class-validator';

export class CancelarAlquilerDto {
  @IsOptional()
  @IsDateString()
  fechaCancelacion?: string;

  @IsOptional()
  @IsString()
  @MaxLength(250)
  motivo?: string;
}