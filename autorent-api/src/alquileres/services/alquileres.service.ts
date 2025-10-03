import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Alquiler, EstadoAlquiler } from '../entities/alquiler.entity';
import { CreateAlquilerDto } from '../dto/create-alquiler.dto';
import { FinalizarAlquilerDto } from '../dto/finalizar-alquiler.dto';
import { Cliente } from '../../clientes/entities/cliente.entity';
import {
  EstadoVehiculo,
  Vehiculo,
} from '../../vehiculos/entities/vehiculo.entity';

@Injectable()
export class AlquileresService {
  constructor(
    @InjectRepository(Alquiler)
    private readonly alquilerRepository: Repository<Alquiler>,
    @InjectRepository(Cliente)
    private readonly clientesRepository: Repository<Cliente>,
    @InjectRepository(Vehiculo)
    private readonly vehiculosRepository: Repository<Vehiculo>,
  ) {}

  async findAll(): Promise<Alquiler[]> {
    return this.alquilerRepository.find({ order: { creadoEn: 'DESC' } });
  }

  async findOne(id: string): Promise<Alquiler> {
    const alquiler = await this.alquilerRepository.findOne({ where: { id } });
    if (!alquiler) {
      throw new NotFoundException(`Alquiler con id ${id} no encontrado`);
    }
    return alquiler;
  }

  async create(dto: CreateAlquilerDto): Promise<Alquiler> {
    const { clienteId, vehiculoId, fechaInicio, fechaFinEstimada } = dto;

    this.ensureFechaFinPosterior(fechaInicio, fechaFinEstimada);

    return this.alquilerRepository.manager.transaction(async (manager) => {
      const vehiculosRepo = manager.getRepository(Vehiculo);
      const clientesRepo = manager.getRepository(Cliente);
      const alquilerRepo = manager.getRepository(Alquiler);

      const vehiculo = await vehiculosRepo.findOne({
        where: { id: vehiculoId },
      });
      if (!vehiculo) {
        throw new NotFoundException(
          `Vehículo con id ${vehiculoId} no encontrado`,
        );
      }
      if (
        vehiculo.estado === EstadoVehiculo.NO_DISPONIBLE ||
        vehiculo.estado === EstadoVehiculo.EN_MANTENIMIENTO
      ) {
        throw new ConflictException(
          'El vehículo no está disponible para alquiler',
        );
      }
      if (vehiculo.estado === EstadoVehiculo.DE_BAJA) {
        throw new ConflictException('El vehículo está dado de baja');
      }
      if (typeof vehiculo.precioPorDia !== 'number') {
        throw new UnprocessableEntityException(
          'El vehículo no tiene configurado el precio por día',
        );
      }

      const cliente = await clientesRepo.findOne({ where: { id: clienteId } });
      if (!cliente) {
        throw new NotFoundException(
          `Cliente con id ${clienteId} no encontrado`,
        );
      }

      const dias = this.calcularDias(fechaInicio, fechaFinEstimada);
      const precioDia = vehiculo.precioPorDia;
      const totalEstimado = this.redondearMoneda(precioDia * dias);

      vehiculo.estado = EstadoVehiculo.NO_DISPONIBLE;
      await vehiculosRepo.save(vehiculo);

      const alquiler = alquilerRepo.create({
        cliente,
        vehiculo,
        fechaInicio,
        fechaFinEstimada,
        precioDiaReservado: this.redondearMoneda(precioDia),
        totalEstimado,
        estado: EstadoAlquiler.EN_CURSO,
      });

      return alquilerRepo.save(alquiler);
    });
  }

  async finalizar(id: string, dto: FinalizarAlquilerDto): Promise<Alquiler> {
    const { fechaFinReal } = dto;

    return this.alquilerRepository.manager.transaction(async (manager) => {
      const alquilerRepo = manager.getRepository(Alquiler);
      const vehiculosRepo = manager.getRepository(Vehiculo);

      const alquiler = await alquilerRepo.findOne({ where: { id } });
      if (!alquiler) {
        throw new NotFoundException(`Alquiler con id ${id} no encontrado`);
      }

      if (alquiler.estado === EstadoAlquiler.FINALIZADO) {
        throw new ConflictException('El alquiler ya está finalizado');
      }
      if (alquiler.estado === EstadoAlquiler.CANCELADO) {
        throw new ConflictException('El alquiler está cancelado');
      }

      this.ensureFechaFinPosterior(alquiler.fechaInicio, fechaFinReal);

      const dias = this.calcularDias(alquiler.fechaInicio, fechaFinReal);
      const totalFinal = this.redondearMoneda(
        alquiler.precioDiaReservado * dias,
      );

      alquiler.fechaFinReal = fechaFinReal;
      alquiler.totalFinal = totalFinal;
      alquiler.estado = EstadoAlquiler.FINALIZADO;

      await alquilerRepo.save(alquiler);

      const vehiculo = await vehiculosRepo.findOne({
        where: { id: alquiler.vehiculo.id },
      });
      if (vehiculo) {
        vehiculo.estado = EstadoVehiculo.DISPONIBLE;
        await vehiculosRepo.save(vehiculo);
      }

      return alquiler;
    });
  }

  private ensureFechaFinPosterior(inicio: string, fin: string) {
    const start = new Date(inicio);
    const end = new Date(fin);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      throw new BadRequestException(
        'Las fechas deben tener formato ISO válido (YYYY-MM-DD)',
      );
    }

    if (end <= start) {
      throw new BadRequestException(
        'La fecha de fin debe ser posterior a la fecha de inicio',
      );
    }
  }

  private calcularDias(inicio: string, fin: string): number {
    const start = new Date(inicio);
    const end = new Date(fin);
    const diffMs = end.getTime() - start.getTime();
    const dias = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return Math.max(dias, 1);
  }

  private redondearMoneda(valor: number): number {
    return Math.round(valor * 100) / 100;
  }
}
