import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export enum RolEmpleado {
  ADMIN = 'ADMIN',
  EMPLEADO = 'EMPLEADO',
}

@Entity('empleados')
export class Empleado {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nombres: string;

  @Column()
  apellidos: string;

  @Column({ unique: true })
  email: string;

  // Importante: el hash de la contraseña
  @Column({ name: 'password_hash' })
  passwordHash: string;

  @Column({ type: 'enum', enum: RolEmpleado, default: RolEmpleado.EMPLEADO })
  rol: RolEmpleado;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

