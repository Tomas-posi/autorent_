import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
  IsUrl,
} from 'class-validator';
import { RolEmpleado } from '../entities/empleado.entity';

export class UpdateEmpleadoDto {
  @IsOptional()
  @IsString()
  nombres?: string;

  @IsOptional()
  @IsString()
  apellidos?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string;

  @IsOptional()
  @IsEnum(RolEmpleado)
  rol?: RolEmpleado;

  @IsOptional()
  @IsUrl({}, { message: 'avatarUrl must be a valid URL' })
  avatarUrl?: string;
}
