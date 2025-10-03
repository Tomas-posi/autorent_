import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { TipoDocumento } from '../entities/cliente.entity';

export class CreateClienteDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  nombres: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  apellidos: string;

  @IsEnum(TipoDocumento)
  tipoDocumento: TipoDocumento;

  @IsString()
  @IsNotEmpty()
  @MinLength(4)
  @MaxLength(30)
  numeroDocumento: string;

  @IsEmail()
  @MaxLength(160)
  email: string;

  @IsString()
  @MinLength(7)
  @MaxLength(30)
  telefono: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  direccion?: string;
}
