import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { EmpleadosService } from '../empleados/services/empleado.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly empleados: EmpleadosService,
    private readonly jwt: JwtService,
  ) {}

  async login(email: string, password: string) {
    const empleado = await this.empleados.findByEmail(email);
    if (!empleado) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Si passwordHash viene undefined -> evita 500 y lanza Unauthorized
    const hash = (empleado as any).passwordHash;
    if (!hash) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const ok = await bcrypt.compare(password, hash);
    if (!ok) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload = {
      sub: empleado.id,
      email: empleado.email,
      name: `${empleado.nombres} ${empleado.apellidos}`,
      rol: empleado.rol,
    };

    return { access_token: await this.jwt.signAsync(payload) };
  }
}

