import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class RegisterEmpleadoDto {
  @IsString()
  @IsNotEmpty()
  nombres: string;

  @IsString()
  @IsNotEmpty()
  apellidos: string;

  @IsEmail()
  email: string;

  // ajusta si usas MinLength(8) en vez de exactamente 8
  @IsString()
  @Length(8, 8, { message: 'password must be exactly 8 characters long' })
  password: string;
}
