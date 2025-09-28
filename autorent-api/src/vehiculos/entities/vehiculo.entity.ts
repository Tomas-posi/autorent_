import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Index,
  Unique,
} from 'typeorm';

export enum EstadoVehiculo {
  DISPONIBLE = 'DISPONIBLE',
  NO_DISPONIBLE = 'NO_DISPONIBLE',
  EN_MANTENIMIENTO = 'EN_MANTENIMIENTO',
  DE_BAJA = 'DE_BAJA',
}

export enum TipoCombustible {
  GASOLINA = 'GASOLINA',
  DIESEL = 'DIESEL',
  HIBRIDO = 'HIBRIDO',
  ELECTRICO = 'ELECTRICO',
}

@Entity('vehiculo')
@Unique(['placa'])
@Index('idx_vehiculo_estado', ['estado'])
export class Vehiculo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 10 })
  @Index({ unique: true })
  placa: string;

  @Column({ length: 80 })
  marca: string;

  @Column({ length: 80 })
  modelo: string;

  @Column()
  anio: number;

  @Column({ length: 17, nullable: true, unique: true })
  vin?: string;

  @Column({ type: 'enum', enum: TipoCombustible, nullable: true })
  combustible?: TipoCombustible;

  @Column({
    type: 'enum',
    enum: EstadoVehiculo,
    default: EstadoVehiculo.DISPONIBLE,
  })
  estado: EstadoVehiculo;

  @CreateDateColumn({ name: 'creado_en', type: 'timestamptz' })
  creadoEn: Date;

  @UpdateDateColumn({ name: 'actualizado_en', type: 'timestamptz' })
  actualizadoEn: Date;
}
