import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { EmpleadosService } from '../services/empleado.service';
import { CreateEmpleadoDto } from '../dto/create-empleado.dto';
import { UpdateEmpleadoDto } from '../dto/update-empleado.dto';
import { RegisterEmpleadoDto } from '../dto/register-empleado.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guards';
import { Roles, RolesGuard } from '../../auth/guards/roles.guard';
import { RolEmpleado } from '../entities/empleado.entity';

@Controller('empleados')
export class EmpleadosController {
  constructor(private readonly service: EmpleadosService) {}

  // Registro PÚBLICO: fuerza rol EMPLEADO
  @Post('register')
  async publicRegister(@Body() dto: RegisterEmpleadoDto) {
    const creado = await this.service.create({
      ...dto,
      rol: RolEmpleado.EMPLEADO,
    } as CreateEmpleadoDto);

    const { passwordHash, ...clean } = creado as any;
    return clean;
  }

  // Crear (ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RolEmpleado.ADMIN)
  @Post()
  create(@Body() dto: CreateEmpleadoDto) {
    return this.service.create(dto);
  }

  // Listar (ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RolEmpleado.ADMIN)
  @Get()
  findAll() {
    return this.service.findAll();
  }

  // Perfil propio
  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() req: any) {
    return this.service.findById(req.user.sub);
  }

  // Actualizar (ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RolEmpleado.ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateEmpleadoDto) {
    return this.service.update(id, dto);
  }

  // Borrar (ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RolEmpleado.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
