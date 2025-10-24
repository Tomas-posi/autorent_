import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { AlquileresService } from '../services/alquileres.service';
import { CreateAlquilerDto } from '../dto/create-alquiler.dto';
import { FinalizarAlquilerDto } from '../dto/finalizar-alquiler.dto';
import { CancelarAlquilerDto } from '../dto/cancelar-alquiler.dto';
import { HistorialVehiculoQueryDto } from '../dto/historial-vehiculo.dto';

@Controller('alquileres')
export class AlquileresController {
  constructor(private readonly service: AlquileresService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateAlquilerDto) {
    return this.service.create(dto);
  }

  @Patch(':id/finalizar')
  finalizar(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: FinalizarAlquilerDto,
  ) {
    return this.service.finalizar(id, dto);
  }

  @Patch(':id/cancelar')
  cancelar(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: CancelarAlquilerDto,
  ) {
    return this.service.cancelar(id, dto);
  }

  @Get('vehiculo/:vehiculoId/historial')
  historialPorVehiculo(
    @Param('vehiculoId', new ParseUUIDPipe()) vehiculoId: string,
    @Query() query: HistorialVehiculoQueryDto,
  ) {
    return this.service.historialPorVehiculo(vehiculoId, query);
  }
}
