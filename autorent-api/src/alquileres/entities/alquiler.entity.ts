import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Cliente } from '../../clientes/entities/cliente.entity';
import { Vehiculo } from '../../vehiculos/entities/vehiculo.entity';

export enum EstadoAlquiler {
  RESERVADO = 'RESERVADO',
  EN_CURSO = 'EN_CURSO',
  FINALIZADO = 'FINALIZADO',
  CANCELADO = 'CANCELADO',
}

@Entity('alquiler')
export class Alquiler {
  private static readonly currencyTransformer = {
    to: (value: number | null | undefined) =>
      typeof value === 'number' ? Number(value.toFixed(2)) : (value ?? null),
    from: (value: string | null) => (value === null ? null : Number(value)),
  };

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Cliente, { eager: true })
  @JoinColumn({ name: 'cliente_id' })
  cliente: Cliente;

  @ManyToOne(() => Vehiculo, { eager: true })
  @JoinColumn({ name: 'vehiculo_id' })
  vehiculo: Vehiculo;

  @Column({ name: 'fecha_inicio', type: 'date' })
  fechaInicio: string;

  @Column({ name: 'fecha_fin_estimada', type: 'date' })
  fechaFinEstimada: string;

  @Column({ name: 'fecha_fin_real', type: 'date', nullable: true })
  fechaFinReal?: string | null;

  @Column({
    name: 'precio_dia_reservado',
    type: 'numeric',
    precision: 10,
    scale: 2,
    transformer: Alquiler.currencyTransformer,
  })
  precioDiaReservado: number;

  @Column({
    name: 'total_estimado',
    type: 'numeric',
    precision: 12,
    scale: 2,
    transformer: Alquiler.currencyTransformer,
  })
  totalEstimado: number;

  @Column({
    name: 'total_final',
    type: 'numeric',
    precision: 12,
    scale: 2,
    nullable: true,
    transformer: Alquiler.currencyTransformer,
  })
  totalFinal?: number | null;

  @Column({
    type: 'enum',
    enum: EstadoAlquiler,
    default: EstadoAlquiler.RESERVADO,
  })
  estado: EstadoAlquiler;

  @CreateDateColumn({ name: 'creado_en', type: 'timestamptz' })
  creadoEn: Date;

  @UpdateDateColumn({ name: 'actualizado_en', type: 'timestamptz' })
  actualizadoEn: Date;
}
