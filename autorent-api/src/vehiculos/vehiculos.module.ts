import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vehiculo } from './entities/vehiculo.entity';
import { VehiculosController } from './controllers/vehiculos.controller';
import { VehiculosService } from './services/vehiculos.service';
import { VehiculoDocumento } from './entities/vehiculo-documento.entity';
import { VehiculosDocumentosController } from './controllers/vehiculos-documentos.controller';
import { VehiculosDocumentosService } from './services/vehiculos-documentos.service';

@Module({
  imports: [TypeOrmModule.forFeature([Vehiculo, VehiculoDocumento])],
  controllers: [VehiculosController, VehiculosDocumentosController],
  providers: [VehiculosService, VehiculosDocumentosService],
  exports: [VehiculosService, VehiculosDocumentosService],
})
export class VehiculosModule {}
