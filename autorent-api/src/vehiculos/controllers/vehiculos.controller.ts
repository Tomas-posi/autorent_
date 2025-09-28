// src/vehiculos/controllers/vehiculos.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { VehiculosService } from '../services/vehiculos.service';
import { CreateVehiculoDto } from '../dto/create-vehiculo.dto';
import { UpdateVehiculoDto } from '../dto/update-vehiculo.dto';

@Controller('vehiculos')
export class VehiculosController {
  constructor(private readonly service: VehiculosService) {}

  // GET /vehiculos
  @Get()
  findAll() {
    return this.service.findAll();
  }

  // GET /vehiculos/:id
  @Get(':id')
  getById(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.service.getById(id);
  }

  // POST /vehiculos
  @Post()
  create(@Body() dto: CreateVehiculoDto) {
    return this.service.create(dto);
  }

  // PATCH /vehiculos/:id
  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateVehiculoDto,
  ) {
    return this.service.update(id, dto);
  }

  // DELETE /vehiculos/:id
  @Delete(':id')
  delete(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.service.delete(id);
  }
}
