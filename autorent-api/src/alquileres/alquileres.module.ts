import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Alquiler } from './entities/alquiler.entity';
import { AlquileresService } from './services/alquileres.service';
import { AlquileresController } from './controllers/alquileres.controller';
import { Cliente } from '../clientes/entities/cliente.entity';
import { Vehiculo } from '../vehiculos/entities/vehiculo.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Alquiler, Cliente, Vehiculo])],
  controllers: [AlquileresController],
  providers: [AlquileresService],
  exports: [AlquileresService],
})
export class AlquileresModule {}
