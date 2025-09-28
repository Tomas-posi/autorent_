import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterEmpleadoDto {
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
}

