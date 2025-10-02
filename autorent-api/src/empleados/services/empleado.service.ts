import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Empleado, RolEmpleado } from '../entities/empleado.entity';
import { CreateEmpleadoDto } from '../dto/create-empleado.dto';
import { UpdateEmpleadoDto } from '../dto/update-empleado.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class EmpleadosService {
  constructor(
    @InjectRepository(Empleado)
    private readonly repo: Repository<Empleado>,
  ) {}

  // Crear empleado (ADMIN) o desde register (forzando rol EMPLEADO en controller)
  async create(dto: CreateEmpleadoDto): Promise<Empleado> {
    const exists = await this.repo.findOne({ where: { email: dto.email } });
    if (exists) {
      throw new ConflictException('El email ya está registrado');
    }

    // Si es ADMIN y no vino avatar, usamos default del entorno
    let avatarUrl = dto.avatarUrl ?? null;
    if (dto.rol === RolEmpleado.ADMIN && !avatarUrl) {
      avatarUrl =
        process.env.ADMIN_DEFAULT_AVATAR ??
        'https://avatars.githubusercontent.com/u/9919?s=200&v=4'; // placeholder
    }

    const entity = this.repo.create({
      nombres: dto.nombres,
      apellidos: dto.apellidos,
      email: dto.email,
      rol: dto.rol ?? RolEmpleado.EMPLEADO,
      avatarUrl,
      passwordHash: await bcrypt.hash(
        dto.password,
        Number(process.env.BCRYPT_SALT_ROUNDS ?? 10),
      ),
    });

    try {
      return await this.repo.save(entity);
    } catch (e: any) {
      if (e?.code === '23505') throw new ConflictException('El email ya está registrado');
      throw e;
    }
  }

  async findAll(): Promise<Empleado[]> {
    return this.repo.find();
  }

  async findById(id: string): Promise<Empleado> {
    const emp = await this.repo.findOne({ where: { id } });
    if (!emp) throw new NotFoundException('Empleado no encontrado');
    return emp;
  }

  // incluye passwordHash para login
  async findByEmail(email: string): Promise<Empleado | null> {
    return this.repo
      .createQueryBuilder('e')
      .addSelect('e.passwordHash')
      .where('e.email = :email', { email })
      .getOne();
  }

  async update(id: string, dto: UpdateEmpleadoDto): Promise<Empleado> {
    const emp = await this.findById(id);

    if (dto.email && dto.email !== emp.email) {
      const dup = await this.repo.findOne({ where: { email: dto.email } });
      if (dup) throw new ConflictException('El email ya está registrado');
      emp.email = dto.email;
    }

    if (dto.nombres !== undefined) emp.nombres = dto.nombres;
    if (dto.apellidos !== undefined) emp.apellidos = dto.apellidos;

    if (dto.password) {
      emp.passwordHash = await bcrypt.hash(
        dto.password,
        Number(process.env.BCRYPT_SALT_ROUNDS ?? 10),
      );
    }

    if (dto.rol !== undefined) emp.rol = dto.rol;
    if (dto.avatarUrl !== undefined) emp.avatarUrl = dto.avatarUrl;

    try {
      return await this.repo.save(emp);
    } catch (e: any) {
      if (e?.code === '23505') throw new ConflictException('El email ya está registrado');
      throw e;
    }
  }

  async remove(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}



