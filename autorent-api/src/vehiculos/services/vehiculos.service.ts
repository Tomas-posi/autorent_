// src/vehiculos/services/vehiculos.service.ts
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vehiculo } from '../entities/vehiculo.entity';
import { CreateVehiculoDto } from '../dto/create-vehiculo.dto';
import { UpdateVehiculoDto } from '../dto/update-vehiculo.dto';

@Injectable()
export class VehiculosService {
  constructor(
    @InjectRepository(Vehiculo)
    private readonly vehiculosRepository: Repository<Vehiculo>,
  ) {}

  // Lista todos (ordenados por más recientes primero)
  async findAll(): Promise<Vehiculo[]> {
    const vehiculos = await this.vehiculosRepository.find({
      order: { creadoEn: 'DESC' },
    });
    return vehiculos;
    // Sirve si luego quieres hacer algo más con la lista
  }

  // Obtiene un vehículo por id (UUID)
  async getById(id: string): Promise<Vehiculo> {
    const vehiculo = await this.findOne(id);
    return vehiculo;
  }

  // Crea un vehículo (valida placa única)
  async create(body: CreateVehiculoDto): Promise<Vehiculo> {
    try {
      // Unicidad de placa
      const dup = await this.vehiculosRepository.findOne({
        where: { placa: body.placa },
      });
      if (dup) throw new ConflictException('La placa ya existe');

      const nuevo = this.vehiculosRepository.create(body);
      const guardado = await this.vehiculosRepository.save(nuevo);
      // devolvemos desde DB por si hay defaults/transformaciones
      return this.findOne(guardado.id);
    } catch (err) {
      if (err instanceof ConflictException) throw err;
      throw new BadRequestException('Error creando vehículo');
    }
  }

  // Elimina un vehículo por id
  async delete(id: string): Promise<{ message: string }> {
    try {
      await this.vehiculosRepository.delete(id);
      return { message: 'Vehículo eliminado' };
    } catch {
      throw new BadRequestException('Error eliminando vehículo');
    }
  }

  // Actualiza un vehículo (valida cambio de placa si aplica)
  async update(id: string, changes: UpdateVehiculoDto): Promise<Vehiculo> {
    try {
      const current = await this.findOne(id);

      if (changes.placa && changes.placa !== current.placa) {
        const dup = await this.vehiculosRepository.findOne({
          where: { placa: changes.placa },
        });
        if (dup) throw new ConflictException('La placa ya existe');
      }

      const actualizado = this.vehiculosRepository.merge(current, changes);
      const guardado = await this.vehiculosRepository.save(actualizado);
      return guardado;
    } catch (err) {
      if (err instanceof ConflictException || err instanceof NotFoundException)
        throw err;
      throw new BadRequestException('Error actualizando vehículo');
    }
  }

  /* Debe ser async porque consulta la base y retorna una promesa */
  private async findOne(id: string): Promise<Vehiculo> {
    const vehiculo = await this.vehiculosRepository.findOne({
      where: { id },
      // relations: [] // agrega relaciones aquí cuando existan
    });
    if (!vehiculo) {
      throw new NotFoundException(`Vehículo con id ${id} no encontrado`);
    }
    return vehiculo;
  }

  // Utilidad para validaciones/integraciones
  async findByPlaca(placa: string): Promise<Vehiculo | null> {
    const vehiculo = await this.vehiculosRepository.findOne({
      where: { placa },
    });
    return vehiculo;
  }
}
