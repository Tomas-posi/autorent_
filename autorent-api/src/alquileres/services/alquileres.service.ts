// autorent-api/src/alquileres/services/alquileres.service.ts
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { Alquiler, EstadoAlquiler } from '../entities/alquiler.entity';
import { CreateAlquilerDto } from '../dto/create-alquiler.dto';
import { FinalizarAlquilerDto } from '../dto/finalizar-alquiler.dto';
import { CancelarAlquilerDto } from '../dto/cancelar-alquiler.dto';
import {
  HistorialVehiculoItemDto,
  HistorialVehiculoQueryDto,
} from '../dto/historial-vehiculo.dto';
import { Cliente } from '../../clientes/entities/cliente.entity';
import {
  EstadoVehiculo,
  Vehiculo,
} from '../../vehiculos/entities/vehiculo.entity';

@Injectable()
export class AlquileresService {
  private static readonly BUFFER_DIAS = 3;

  constructor(
    @InjectRepository(Alquiler)
    private readonly alquilerRepository: Repository<Alquiler>,
    @InjectRepository(Cliente)
    private readonly clientesRepository: Repository<Cliente>,
    @InjectRepository(Vehiculo)
    private readonly vehiculosRepository: Repository<Vehiculo>,
  ) {}

  // ──────────────────────────────────────────────────────────────────────────────
  // Normalización de estado al leer (corrige datos viejos)
  // ──────────────────────────────────────────────────────────────────────────────
  private todayISO(): string {
    return new Date().toISOString().slice(0, 10);
  }

  private async normalizeOne(a: Alquiler): Promise<Alquiler> {
    const today = this.todayISO();

    // No tocar finalizados o cancelados
    if (a.estado === EstadoAlquiler.FINALIZADO || a.estado === EstadoAlquiler.CANCELADO) {
      return a;
    }

    const shouldBeReservado = a.fechaInicio > today;
    const shouldBeEnCurso = a.fechaInicio <= today;

    if (shouldBeReservado && a.estado !== EstadoAlquiler.RESERVADO) {
      // Pasar a RESERVADO y liberar vehículo
      a.estado = EstadoAlquiler.RESERVADO;
      await this.alquilerRepository.manager.transaction(async (m) => {
        const vehRepo = m.getRepository(Vehiculo);
        const v = await vehRepo.findOne({ where: { id: a.vehiculo.id } });
        if (v && v.estado !== EstadoVehiculo.DE_BAJA && v.estado !== EstadoVehiculo.EN_MANTENIMIENTO) {
          v.estado = EstadoVehiculo.DISPONIBLE;
          await vehRepo.save(v);
        }
        await m.getRepository(Alquiler).save(a);
      });
    } else if (shouldBeEnCurso && a.estado !== EstadoAlquiler.EN_CURSO) {
      // Pasar a EN_CURSO y bloquear vehículo
      a.estado = EstadoAlquiler.EN_CURSO;
      await this.alquilerRepository.manager.transaction(async (m) => {
        const vehRepo = m.getRepository(Vehiculo);
        const v = await vehRepo.findOne({ where: { id: a.vehiculo.id } });
        if (v && v.estado !== EstadoVehiculo.DE_BAJA && v.estado !== EstadoVehiculo.EN_MANTENIMIENTO) {
          v.estado = EstadoVehiculo.NO_DISPONIBLE;
          await vehRepo.save(v);
        }
        await m.getRepository(Alquiler).save(a);
      });
    }

    return a;
  }

  private async normalizeMany(rows: Alquiler[]): Promise<Alquiler[]> {
    const out: Alquiler[] = [];
    for (const a of rows) {
      out.push(await this.normalizeOne(a));
    }
    return out;
  }

  // ──────────────────────────────────────────────────────────────────────────────
  // LISTAR / OBTENER
  // ──────────────────────────────────────────────────────────────────────────────
  async findAll(): Promise<Alquiler[]> {
    const rows = await this.alquilerRepository.find({ order: { creadoEn: 'DESC' } });
    return this.normalizeMany(rows);
  }

  async findOne(id: string): Promise<Alquiler> {
    const alquiler = await this.alquilerRepository.findOne({ where: { id } });
    if (!alquiler) throw new NotFoundException(`Alquiler con id ${id} no encontrado`);
    return this.normalizeOne(alquiler);
  }

  // ──────────────────────────────────────────────────────────────────────────────
  // CREAR
  // ──────────────────────────────────────────────────────────────────────────────
  async create(dto: CreateAlquilerDto): Promise<Alquiler> {
    const { clienteId, vehiculoId, fechaInicio, fechaFinEstimada } = dto;

    this.ensureFechaFinPosterior(fechaInicio, fechaFinEstimada);

    return this.alquilerRepository.manager.transaction(async (manager) => {
      const vehiculosRepo = manager.getRepository(Vehiculo);
      const clientesRepo = manager.getRepository(Cliente);
      const alquilerRepo = manager.getRepository(Alquiler);

      const vehiculo = await vehiculosRepo.findOne({ where: { id: vehiculoId } });
      if (!vehiculo) throw new NotFoundException(`Vehículo con id ${vehiculoId} no encontrado`);
      if (vehiculo.estado === EstadoVehiculo.DE_BAJA) throw new ConflictException('El vehículo está dado de baja');
      if (vehiculo.estado === EstadoVehiculo.EN_MANTENIMIENTO) throw new ConflictException('El vehículo está en mantenimiento');
      if (typeof vehiculo.precioPorDia !== 'number') {
        throw new UnprocessableEntityException('El vehículo no tiene configurado el precio por día');
      }

      const cliente = await clientesRepo.findOne({ where: { id: clienteId } });
      if (!cliente) throw new NotFoundException(`Cliente con id ${clienteId} no encontrado`);

      await this.ensureRangoDisponibleConBuffer(alquilerRepo, vehiculoId, fechaInicio, fechaFinEstimada);

      const dias = this.calcularDias(fechaInicio, fechaFinEstimada);
      const precioDia = vehiculo.precioPorDia;
      const totalEstimado = this.redondearMoneda(precioDia * dias);

      const hoyISO = this.todayISO();
      const estado = fechaInicio > hoyISO ? EstadoAlquiler.RESERVADO : EstadoAlquiler.EN_CURSO;

      if (estado === EstadoAlquiler.EN_CURSO) {
        vehiculo.estado = EstadoVehiculo.NO_DISPONIBLE;
        await vehiculosRepo.save(vehiculo);
      }

      const alquiler = alquilerRepo.create({
        cliente,
        vehiculo,
        fechaInicio,
        fechaFinEstimada,
        precioDiaReservado: this.redondearMoneda(precioDia),
        totalEstimado,
        estado,
      });

      return alquilerRepo.save(alquiler);
    });
  }

  // ──────────────────────────────────────────────────────────────────────────────
  // FINALIZAR (solo EN_CURSO)
  // ──────────────────────────────────────────────────────────────────────────────
  async finalizar(id: string, dto: FinalizarAlquilerDto): Promise<Alquiler> {
    return this.alquilerRepository.manager.transaction(async (manager) => {
      const alquilerRepo = manager.getRepository(Alquiler);
      const vehiculosRepo = manager.getRepository(Vehiculo);

      const alquiler = await alquilerRepo.findOne({ where: { id } });
      if (!alquiler) throw new NotFoundException(`Alquiler con id ${id} no encontrado`);
      if (alquiler.estado !== EstadoAlquiler.EN_CURSO) {
        throw new ConflictException('Solo se puede finalizar un alquiler EN_CURSO');
      }

      const fechaFinReal = this.toISODate(dto.fechaFinReal);
      this.ensureFechaFinPosterior(alquiler.fechaInicio, fechaFinReal);

      const dias = this.calcularDias(alquiler.fechaInicio, fechaFinReal);
      const totalFinal = this.redondearMoneda(alquiler.precioDiaReservado * dias);

      alquiler.fechaFinReal = fechaFinReal;
      alquiler.totalFinal = totalFinal;
      alquiler.estado = EstadoAlquiler.FINALIZADO;
      alquiler.fechaCancelacion = null;
      alquiler.motivoCancelacion = null;

      await alquilerRepo.save(alquiler);

      const vehiculo = await vehiculosRepo.findOne({ where: { id: alquiler.vehiculo.id } });
      if (vehiculo) {
        vehiculo.estado = EstadoVehiculo.DISPONIBLE;
        await vehiculosRepo.save(vehiculo);
      }

      return alquiler;
    });
  }

  // ──────────────────────────────────────────────────────────────────────────────
  // CANCELAR (solo RESERVADO antes del inicio, motivo obligatorio)
  // ──────────────────────────────────────────────────────────────────────────────
  async cancelar(id: string, dto: CancelarAlquilerDto): Promise<Alquiler> {
    return this.alquilerRepository.manager.transaction(async (manager) => {
      const alquilerRepo = manager.getRepository(Alquiler);

      const alquiler = await alquilerRepo.findOne({ where: { id } });
      if (!alquiler) throw new NotFoundException(`Alquiler con id ${id} no encontrado`);
      if (alquiler.estado !== EstadoAlquiler.RESERVADO) {
        throw new ConflictException('Solo se puede cancelar un alquiler RESERVADO.');
      }

      const fechaCancelacion = this.toISODate(dto.fechaCancelacion ?? new Date());
      this.ensureCancelAntesDeInicio(alquiler.fechaInicio, fechaCancelacion);

      const motivo = (dto.motivo ?? '').trim();
      if (!motivo) throw new BadRequestException('El motivo de cancelación es obligatorio.');

      alquiler.estado = EstadoAlquiler.CANCELADO;
      alquiler.fechaCancelacion = fechaCancelacion;
      alquiler.motivoCancelacion = motivo;
      alquiler.fechaFinReal = null;
      alquiler.totalFinal = null;

      await alquilerRepo.save(alquiler);
      return alquiler;
    });
  }

  // ──────────────────────────────────────────────────────────────────────────────
  // HISTORIAL POR VEHÍCULO
  // ──────────────────────────────────────────────────────────────────────────────
  async historialPorVehiculo(
    vehiculoId: string,
    query: HistorialVehiculoQueryDto,
  ): Promise<HistorialVehiculoItemDto[]> {
    const vehiculo = await this.vehiculosRepository.findOne({ where: { id: vehiculoId } });
    if (!vehiculo) throw new NotFoundException(`Vehículo con id ${vehiculoId} no encontrado`);

    const qb = this.alquilerRepository
      .createQueryBuilder('alquiler')
      .leftJoinAndSelect('alquiler.cliente', 'cliente')
      .where('alquiler.vehiculo_id = :vehiculoId', { vehiculoId })
      .orderBy('alquiler.fecha_inicio', 'DESC');

    if (query.estado) qb.andWhere('alquiler.estado = :estado', { estado: query.estado });

    if (query.desde) {
      qb.andWhere('alquiler.fecha_inicio >= :desde', { desde: this.toISODate(query.desde) });
    }

    if (query.hasta) {
      const hasta = this.toISODate(query.hasta);
      qb.andWhere(
        new Brackets((expr) => {
          expr
            .where('alquiler.fecha_fin_real <= :hasta', { hasta })
            .orWhere('alquiler.fecha_fin_real IS NULL AND alquiler.fecha_fin_estimada <= :hasta', { hasta });
        }),
      );
    }

    const alquileres = await qb.getMany();
    // Normaliza también los del historial (útil si se consulta por vehículo)
    await this.normalizeMany(alquileres);

    return alquileres.map<HistorialVehiculoItemDto>((alquiler) => {
      const base: HistorialVehiculoItemDto = {
        id: alquiler.id,
        estado: alquiler.estado,
        fechaInicio: alquiler.fechaInicio,
        fechaFinEstimada: alquiler.fechaFinEstimada,
        fechaFinReal: alquiler.fechaFinReal ?? null,
        totalEstimado: alquiler.totalEstimado,
        totalFinal: alquiler.totalFinal ?? null,
        cliente: {
          id: alquiler.cliente.id,
          nombres: alquiler.cliente.nombres,
          apellidos: alquiler.cliente.apellidos,
          numeroDocumento: alquiler.cliente.numeroDocumento,
          email: alquiler.cliente.email,
        },
      };

      const tieneDatosCancelacion =
        alquiler.fechaCancelacion != null || alquiler.motivoCancelacion != null;

      if (tieneDatosCancelacion) {
        return {
          ...base,
          cancelacion: {
            fecha: (alquiler.fechaCancelacion as string | null) ?? null,
            motivo: (alquiler.motivoCancelacion as string | null) ?? null,
          },
        };
      }

      return base;
    });
  }

  // ──────────────────────────────────────────────────────────────────────────────
  // Validaciones / helpers
  // ──────────────────────────────────────────────────────────────────────────────
  private async ensureRangoDisponibleConBuffer(
    alquilerRepo: Repository<Alquiler>,
    vehiculoId: string,
    fechaInicio: string,
    fechaFinEstimada: string,
  ) {
    const buffer = AlquileresService.BUFFER_DIAS;

    const existentes = await alquilerRepo.find({
      where: { vehiculo: { id: vehiculoId } },
      order: { fechaInicio: 'ASC' },
    });

    const start = this.startOfDay(fechaInicio);
    const end = this.startOfDay(fechaFinEstimada);

    for (const a of existentes) {
      if (a.estado === EstadoAlquiler.CANCELADO) continue;

      const aStart = this.startOfDay(a.fechaInicio);
      const aEnd = this.startOfDay(a.fechaFinReal ?? a.fechaFinEstimada);

      const aStartBuf = this.addDays(aStart, -buffer);
      const aEndBuf = this.addDays(aEnd, buffer);

      const overlap = start <= aEndBuf && end >= aStartBuf;
      if (overlap) {
        throw new ConflictException(
          `Las fechas se cruzan o no respetan ${buffer} días de separación con un alquiler existente (${a.fechaInicio} → ${a.fechaFinReal ?? a.fechaFinEstimada}).`,
        );
      }
    }
  }

  private ensureFechaFinPosterior(inicio: string, fin: string) {
    const start = new Date(inicio);
    const end = new Date(fin);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      throw new BadRequestException('Las fechas deben tener formato ISO válido (YYYY-MM-DD)');
    }
    if (end <= start) {
      throw new BadRequestException('La fecha de fin debe ser posterior a la fecha de inicio');
    }
  }

  private ensureCancelAntesDeInicio(inicio: string, fechaCancel: string) {
    const start = new Date(inicio);
    const cancel = new Date(fechaCancel);
    if (Number.isNaN(start.getTime()) || Number.isNaN(cancel.getTime())) {
      throw new BadRequestException('Las fechas deben tener formato ISO válido (YYYY-MM-DD)');
    }
    if (cancel >= start) {
      throw new BadRequestException('Solo se puede cancelar antes de la fecha de inicio.');
    }
  }

  private toISODate(input: string | Date): string {
    const date = input instanceof Date ? input : new Date(input);
    if (Number.isNaN(date.getTime())) {
      throw new BadRequestException('Las fechas deben tener formato ISO válido (YYYY-MM-DD)');
    }
    return date.toISOString().slice(0, 10);
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

  private startOfDay(isoDate: string): Date {
    const d = new Date(isoDate);
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }

  private addDays(d: Date, days: number): Date {
    const r = new Date(d);
    r.setDate(r.getDate() + days);
    return r;
  }
}



