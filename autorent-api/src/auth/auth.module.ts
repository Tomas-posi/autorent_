import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { EmpleadosModule } from '../empleados/empleados.module';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    EmpleadosModule, // 👈 importante para inyectar EmpleadosService
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET', { infer: true }),
        signOptions: {
          expiresIn: config.get<string>('JWT_EXPIRES', { infer: true }) ?? '1d',
        },
      }),
    }),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
