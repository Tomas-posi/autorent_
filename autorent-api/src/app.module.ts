import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

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
      useFactory: () => ({
        type: 'postgres',
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT ?? 5432),
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        autoLoadEntities: true,
        synchronize: true,
      }),
    }),
    EmpleadosModule,
    AuthModule,
    VehiculosModule,
    ClientesModule,
    AlquileresModule,
  ],
})
export class AppModule {}
