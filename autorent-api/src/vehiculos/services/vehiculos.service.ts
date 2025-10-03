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

  // Crea un vehículo (valida placa/VIN únicos)
  async create(body: CreateVehiculoDto): Promise<Vehiculo> {
    try {
      // Unicidad de placa (validación de aplicación)
      const dupPlaca = await this.vehiculosRepository.findOne({
        where: { placa: body.placa },
      });
      if (dupPlaca) throw new ConflictException('La placa ya existe');

      // Unicidad de VIN (validación de aplicación)
      if (body.vin) {
        const dupVin = await this.vehiculosRepository.findOne({
          where: { vin: body.vin as any },
        });
        if (dupVin) throw new ConflictException('El VIN ya existe');
      }

      const nuevo = this.vehiculosRepository.create(body);
      const guardado = await this.vehiculosRepository.save(nuevo);
      // devolvemos desde DB por si hay defaults/transformaciones
      return this.findOne(guardado.id);
    } catch (err: any) {
      // Manejo de UNIQUE en base de datos (race conditions o validaciones faltantes)
      const handled = this.handleUniqueDBError(err, {
        placa: body.placa,
        vin: body.vin as any,
      });
      if (handled) throw handled;

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

  // Actualiza un vehículo (valida cambio de placa/VIN si aplica)
  async update(id: string, changes: UpdateVehiculoDto): Promise<Vehiculo> {
    try {
      const current = await this.findOne(id);

      // Validación de aplicación: placa única si cambió
      if (changes.placa && changes.placa !== current.placa) {
        const dup = await this.vehiculosRepository.findOne({
          where: { placa: changes.placa },
        });
        if (dup) throw new ConflictException('La placa ya existe');
      }

      // Validación de aplicación: VIN único si cambió
      if (
        typeof changes.vin !== 'undefined' &&
        changes.vin !== (current as any).vin
      ) {
        const dupVin = await this.vehiculosRepository.findOne({
          where: { vin: changes.vin as any },
        });
        if (dupVin) throw new ConflictException('El VIN ya existe');
      }

      const actualizado = this.vehiculosRepository.merge(current, changes);
      const guardado = await this.vehiculosRepository.save(actualizado);
      return guardado;
    } catch (err: any) {
      // Manejo de UNIQUE en base de datos
      const handled = this.handleUniqueDBError(err, {
        placa: changes.placa ?? (await this.findOne(id)).placa,
        vin: (changes as any).vin ?? ((await this.findOne(id)) as any).vin,
      });
      if (handled) throw handled;

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

  // Traduce errores de UNIQUE de la base a 409 con mensaje claro
  private handleUniqueDBError(
    err: any,
    ctx: { placa?: string; vin?: string },
  ): ConflictException | null {
    // Postgres: 23505 = unique_violation
    const code = err?.code;
    const msg = String(err?.message ?? '');
    const detail = String(err?.detail ?? '');
    const text = (detail || msg).toLowerCase();

    const isUnique =
      code === '23505' ||
      /unique/i.test(msg) ||
      /duplicate/i.test(msg) ||
      /unique/i.test(detail) ||
      /duplicate/i.test(detail);

    if (!isUnique) return null;

    // Intenta identificar la columna en el detalle del error
    if (text.includes('(placa)')) {
      return new ConflictException(
        `La placa ya existe${ctx.placa ? ` (${ctx.placa})` : ''}`,
      );
    }
    if (text.includes('(vin)')) {
      return new ConflictException(
        `El VIN ya existe${ctx.vin ? ` (${ctx.vin})` : ''}`,
      );
    }
    return new ConflictException('La placa o el VIN ya existen');
  }
}
