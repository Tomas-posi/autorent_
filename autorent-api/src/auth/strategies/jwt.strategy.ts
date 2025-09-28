import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // 👇 toma el secreto desde variables de entorno
      secretOrKey: config.get<string>('JWT_SECRET', { infer: true }),
    });
  }

  async validate(payload: any) {
    // esto será req.user
    return { sub: payload.sub, email: payload.email, name: payload.name, rol: payload.rol };
  }
}

