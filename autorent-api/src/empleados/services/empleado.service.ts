import { Injectable, NotFoundException } from '@nestjs/common';
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

  async create(dto: CreateEmpleadoDto): Promise<Empleado> {
    const entity = this.repo.create({
      nombres: dto.nombres,
      apellidos: dto.apellidos,
      email: dto.email,
      rol: dto.rol ?? RolEmpleado.EMPLEADO,
      // guarda SIEMPRE el hash:
      passwordHash: await bcrypt.hash(
        dto.password,
        Number(process.env.BCRYPT_SALT_ROUNDS ?? 10),
      ),
    });
    return this.repo.save(entity);
  }

  async findAll(): Promise<Empleado[]> {
    return this.repo.find();
  }

  async findById(id: string): Promise<Empleado> {
    const emp = await this.repo.findOne({ where: { id } });
    if (!emp) throw new NotFoundException('Empleado no encontrado');
    return emp;
  }

  // 👇 Para login: asegúrate de traer passwordHash
  async findByEmail(email: string): Promise<Empleado | null> {
    // Si en tu entidad hubieras puesto select:false al passwordHash,
    // usa query builder para añadirlo. Aquí igual lo forzamos.
    return this.repo
      .createQueryBuilder('e')
      .addSelect('e.passwordHash')
      .where('e.email = :email', { email })
      .getOne();
  }

  async update(id: string, dto: UpdateEmpleadoDto): Promise<Empleado> {
    const emp = await this.findById(id);

    if (dto.nombres !== undefined) emp.nombres = dto.nombres;
    if (dto.apellidos !== undefined) emp.apellidos = dto.apellidos;
    if (dto.email !== undefined) emp.email = dto.email;
    if ((dto as any).password) {
      emp.passwordHash = await bcrypt.hash(
        (dto as any).password,
        Number(process.env.BCRYPT_SALT_ROUNDS ?? 10),
      );
    }
    if ((dto as any).rol !== undefined) emp.rol = (dto as any).rol;

    return this.repo.save(emp);
  }

  async remove(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}


