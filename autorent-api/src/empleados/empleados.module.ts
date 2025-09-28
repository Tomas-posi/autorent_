import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Empleado } from './entities/empleado.entity';
import { EmpleadosService } from './services/empleado.service';
import { EmpleadosController } from './controller/empleado.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Empleado])],
  providers: [EmpleadosService],
  controllers: [EmpleadosController],
  exports: [EmpleadosService, TypeOrmModule], // 👈 exporta el service para AuthModule
})
export class EmpleadosModule {}
