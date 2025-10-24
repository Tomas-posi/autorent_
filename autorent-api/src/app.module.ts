// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';

import { AuthModule } from './auth/auth.module';
import { EmpleadosModule } from './empleados/empleados.module';
import { VehiculosModule } from './vehiculos/vehiculos.module';
import { ClientesModule } from './clientes/clientes.module';
import { AlquileresModule } from './alquileres/alquileres.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService): TypeOrmModuleOptions => {
        const host = config.get<string>('DB_HOST', 'localhost');
        const port = parseInt(config.get<string>('DB_PORT') ?? '5432', 10);
        const username = config.get<string>('DB_USER', 'postgres');      // <-- coincide con tu .env
        const password = config.get<string>('DB_PASS', '');              // <-- coincide con tu .env
        const database = config.get<string>('DB_NAME', 'autorent');

        // Debug opcional (quitar en prod):
        console.log(
          '[DB] host=%s port=%d user=%s passType=%s db=%s',
          host, port, username, typeof password, database,
        );

        return {
          type: 'postgres',
          host,
          port,
          username,
          password,           // ¡no convertir! debe ser string
          database,
          autoLoadEntities: true,
          synchronize: true,  // solo en desarrollo
        };
      },
    }),

    EmpleadosModule,
    AuthModule,
    VehiculosModule,
    ClientesModule,
    AlquileresModule,
  ],
})
export class AppModule {}

