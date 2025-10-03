import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { VehiculosDocumentosService } from '../services/vehiculos-documentos.service';
import { CreateVehiculoDocumentoDto } from '../dto/create-vehiculo-documento.dto';

@Controller('vehiculos/:vehiculoId/documentos')
export class VehiculosDocumentosController {
  constructor(private readonly service: VehiculosDocumentosService) {}

  @Get()
  listar(@Param('vehiculoId', new ParseUUIDPipe()) vehiculoId: string) {
    return this.service.listarPorVehiculo(vehiculoId);
  }

  @Post()
  crear(
    @Param('vehiculoId', new ParseUUIDPipe()) vehiculoId: string,
    @Body() dto: CreateVehiculoDocumentoDto,
  ) {
    return this.service.crear(vehiculoId, dto);
  }

  @Delete(':documentoId')
  eliminar(
    @Param('vehiculoId', new ParseUUIDPipe()) vehiculoId: string,
    @Param('documentoId', new ParseUUIDPipe()) documentoId: string,
  ) {
    return this.service.eliminar(vehiculoId, documentoId);
  }
}
