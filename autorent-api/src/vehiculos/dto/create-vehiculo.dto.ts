import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  Length,
  Max,
  Min,
} from 'class-validator';
import { EstadoVehiculo, TipoCombustible } from '../entities/vehiculo.entity';

export class CreateVehiculoDto {
  @IsString()
  @IsNotEmpty()
  @Length(5, 10)
  placa: string;

  @IsString()
  @IsNotEmpty()
  marca: string;

  @IsString()
  @IsNotEmpty()
  modelo: string;

  @IsInt()
  @Min(1980)
  @Max(new Date().getFullYear() + 1)
  anio: number;

  @IsPositive()
  precioPorDia: number;

  @IsOptional()
  @IsString()
  @Length(17, 17)
  vin?: string;

  @IsOptional()
  @IsEnum(TipoCombustible)
  combustible?: TipoCombustible;

  @IsOptional()
  @IsEnum(EstadoVehiculo)
  estado?: EstadoVehiculo;
}
