import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Vehiculo } from './vehiculo.entity';

export enum TipoVehiculoDocumento {
  SOAT = 'SOAT',
  TECNOMECANICA = 'TECNOMECANICA',
  TARJETA_PROPIEDAD = 'TARJETA_PROPIEDAD',
  POLIZA = 'POLIZA',
  OTRO = 'OTRO',
}

@Entity('vehiculo_documento')
export class VehiculoDocumento {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Vehiculo, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'vehiculo_id' })
  vehiculo: Vehiculo;

  @Column({
    type: 'enum',
    enum: TipoVehiculoDocumento,
    default: TipoVehiculoDocumento.OTRO,
  })
  tipo: TipoVehiculoDocumento;

  @Column({ name: 'nombre_original', length: 255 })
  nombreOriginal: string;

  @Column({ name: 'nombre_archivo', length: 255 })
  nombreArchivo: string;

  @Column({ name: 'mime_type', length: 120 })
  mimeType: string;

  @Column({ type: 'bigint' })
  tamano: string;

  @Column({ name: 'url_archivo', length: 500 })
  urlArchivo: string;

  @Column({ name: 'notas', type: 'varchar', length: 500, nullable: true })
  notas?: string | null;

  @CreateDateColumn({ name: 'creado_en', type: 'timestamptz' })
  creadoEn: Date;

  @UpdateDateColumn({ name: 'actualizado_en', type: 'timestamptz' })
  actualizadoEn: Date;
}
