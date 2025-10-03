import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VehiculoDocumento } from '../entities/vehiculo-documento.entity';
import { Vehiculo } from '../entities/vehiculo.entity';
import { CreateVehiculoDocumentoDto } from '../dto/create-vehiculo-documento.dto';

@Injectable()
export class VehiculosDocumentosService {
  constructor(
    @InjectRepository(VehiculoDocumento)
    private readonly documentosRepo: Repository<VehiculoDocumento>,
    @InjectRepository(Vehiculo)
    private readonly vehiculosRepo: Repository<Vehiculo>,
  ) {}

  async listarPorVehiculo(vehiculoId: string): Promise<VehiculoDocumento[]> {
    await this.ensureVehiculo(vehiculoId);
    return this.documentosRepo.find({
      where: { vehiculo: { id: vehiculoId } },
      order: { creadoEn: 'DESC' },
      relations: { vehiculo: true },
    });
  }

  async crear(
    vehiculoId: string,
    dto: CreateVehiculoDocumentoDto,
  ): Promise<VehiculoDocumento> {
    const vehiculo = await this.ensureVehiculo(vehiculoId);

    try {
      const entity = this.documentosRepo.create({
        ...dto,
        vehiculo,
        tamano: String(dto.tamano),
      });
      return await this.documentosRepo.save(entity);
    } catch (error) {
      const reason =
        error instanceof Error && error.message ? `: ${error.message}` : '';
      throw new BadRequestException(
        `Error guardando documento del vehículo${reason}`,
      );
    }
  }

  async eliminar(vehiculoId: string, documentoId: string): Promise<void> {
    await this.ensureVehiculo(vehiculoId);
    const documento = await this.documentosRepo.findOne({
      where: { id: documentoId, vehiculo: { id: vehiculoId } },
    });
    if (!documento) {
      throw new NotFoundException('Documento no encontrado para este vehículo');
    }

    await this.documentosRepo.remove(documento);
  }

  private async ensureVehiculo(id: string): Promise<Vehiculo> {
    const vehiculo = await this.vehiculosRepo.findOne({ where: { id } });
    if (!vehiculo) {
      throw new NotFoundException(`Vehículo con id ${id} no encontrado`);
    }
    return vehiculo;
  }
}
