import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cliente } from '../entities/cliente.entity';
import { CreateClienteDto } from '../dto/create-cliente.dto';
import { UpdateClienteDto } from '../dto/update-cliente.dto';

@Injectable()
export class ClientesService {
  constructor(
    @InjectRepository(Cliente)
    private readonly clientesRepository: Repository<Cliente>,
  ) {}

  async findAll(): Promise<Cliente[]> {
    return this.clientesRepository.find({ order: { creadoEn: 'DESC' } });
  }

  async getById(id: string): Promise<Cliente> {
    return this.findOne(id);
  }

  async create(dto: CreateClienteDto): Promise<Cliente> {
    try {
      const dupDocumento = await this.clientesRepository.findOne({
        where: { numeroDocumento: dto.numeroDocumento },
      });
      if (dupDocumento) {
        throw new ConflictException('El número de documento ya existe');
      }

      const dupEmail = await this.clientesRepository.findOne({
        where: { email: dto.email },
      });
      if (dupEmail) {
        throw new ConflictException('El email ya existe');
      }

      const entity = this.clientesRepository.create(dto);
      const saved = await this.clientesRepository.save(entity);
      return this.findOne(saved.id);
    } catch (err) {
      const handled = this.handleUniqueDBError(err, {
        numeroDocumento: dto.numeroDocumento,
        email: dto.email,
      });
      if (handled) throw handled;

      if (err instanceof ConflictException) throw err;
      throw new BadRequestException('Error creando cliente');
    }
  }

  async update(id: string, changes: UpdateClienteDto): Promise<Cliente> {
    let current: Cliente | undefined;
    try {
      current = await this.findOne(id);

      if (
        changes.numeroDocumento &&
        changes.numeroDocumento !== current.numeroDocumento
      ) {
        const dupDoc = await this.clientesRepository.findOne({
          where: { numeroDocumento: changes.numeroDocumento },
        });
        if (dupDoc) {
          throw new ConflictException('El número de documento ya existe');
        }
      }

      if (
        typeof changes.email !== 'undefined' &&
        changes.email !== current.email
      ) {
        const dupEmail = await this.clientesRepository.findOne({
          where: { email: changes.email },
        });
        if (dupEmail) {
          throw new ConflictException('El email ya existe');
        }
      }

      const merged = this.clientesRepository.merge(current, changes);
      return await this.clientesRepository.save(merged);
    } catch (err) {
      const handled = this.handleUniqueDBError(err, {
        numeroDocumento: changes.numeroDocumento ?? current?.numeroDocumento,
        email:
          typeof changes.email !== 'undefined' ? changes.email : current?.email,
      });
      if (handled) throw handled;

      if (
        err instanceof ConflictException ||
        err instanceof NotFoundException
      ) {
        throw err;
      }

      throw new BadRequestException('Error actualizando cliente');
    }
  }

  async delete(id: string): Promise<{ message: string }> {
    try {
      await this.clientesRepository.delete(id);
      return { message: 'Cliente eliminado' };
    } catch {
      throw new BadRequestException('Error eliminando cliente');
    }
  }

  async findByDocumento(numeroDocumento: string): Promise<Cliente | null> {
    return this.clientesRepository.findOne({ where: { numeroDocumento } });
  }

  private async findOne(id: string): Promise<Cliente> {
    const cliente = await this.clientesRepository.findOne({ where: { id } });
    if (!cliente) {
      throw new NotFoundException(`Cliente con id ${id} no encontrado`);
    }
    return cliente;
  }

  private handleUniqueDBError(
    err: unknown,
    ctx: { numeroDocumento?: string; email?: string | null },
  ): ConflictException | null {
    if (!err || typeof err !== 'object') return null;

    type UniqueErrorShape = {
      code?: unknown;
      message?: unknown;
      detail?: unknown;
    };

    const errorLike = err as UniqueErrorShape;
    const code =
      typeof errorLike.code === 'string' ? errorLike.code : undefined;
    const msg = typeof errorLike.message === 'string' ? errorLike.message : '';
    const detail = typeof errorLike.detail === 'string' ? errorLike.detail : '';
    const text = (detail || msg).toLowerCase();

    const isUnique =
      code === '23505' ||
      /unique/i.test(msg) ||
      /duplicate/i.test(msg) ||
      /unique/i.test(detail) ||
      /duplicate/i.test(detail);

    if (!isUnique) return null;

    if (text.includes('(numero_documento)')) {
      const value = ctx.numeroDocumento ? ` (${ctx.numeroDocumento})` : '';
      return new ConflictException(`El número de documento ya existe${value}`);
    }

    if (text.includes('(email)')) {
      const value = ctx.email ? ` (${ctx.email})` : '';
      return new ConflictException(`El email ya existe${value}`);
    }

    return new ConflictException('El número de documento o email ya existen');
  }
}
