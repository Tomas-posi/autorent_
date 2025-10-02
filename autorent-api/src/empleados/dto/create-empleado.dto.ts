import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength, IsUrl } from 'class-validator';
import { RolEmpleado } from '../entities/empleado.entity';

export class CreateEmpleadoDto {
  @IsString()
  @IsNotEmpty()
  nombres: string;

  @IsString()
  @IsNotEmpty()
  apellidos: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsEnum(RolEmpleado)
  rol: RolEmpleado; // 'ADMIN' | 'EMPLEADO'

  @IsOptional()
  @IsUrl({}, { message: 'avatarUrl must be a valid URL' })
  avatarUrl?: string;
}

