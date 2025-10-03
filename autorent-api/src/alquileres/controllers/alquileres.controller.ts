import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { AlquileresService } from '../services/alquileres.service';
import { CreateAlquilerDto } from '../dto/create-alquiler.dto';
import { FinalizarAlquilerDto } from '../dto/finalizar-alquiler.dto';

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
}
