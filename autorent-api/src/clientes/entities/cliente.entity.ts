import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

export enum TipoDocumento {
  CEDULA = 'C.C',
  TARJETA_IDENTIDAD = 'T.I',
  PASAPORTE = 'PASAPORTE',
  CEDULA_EXTRANJERIA = 'CEDULA_EXTRANJERIA',
}

@Entity('cliente')
@Unique(['numeroDocumento'])
@Index('idx_cliente_documento', ['numeroDocumento'])
export class Cliente {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 120 })
  nombres: string;

  @Column({ length: 120 })
  apellidos: string;

  @Column({
    name: 'tipo_documento',
    type: 'enum',
    enum: TipoDocumento,
  })
  tipoDocumento: TipoDocumento;

  @Column({
    name: 'numero_documento',
    length: 30,
    unique: true,
  })
  numeroDocumento: string;

  @Column({ length: 160, unique: true })
  email: string;

  @Column({ length: 30 })
  telefono: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  direccion?: string | null;

  @CreateDateColumn({ name: 'creado_en', type: 'timestamptz' })
  creadoEn: Date;

  @UpdateDateColumn({ name: 'actualizado_en', type: 'timestamptz' })
  actualizadoEn: Date;
}
