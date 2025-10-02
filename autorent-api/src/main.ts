// autorent-api/src/main.ts
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

// Seed admin
import { EmpleadosService } from './empleados/services/empleado.service';
import { RolEmpleado } from './empleados/entities/empleado.entity';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Prefijo global: todas las rutas serán /api/...
  app.setGlobalPrefix('api');

  // Validaciones globales
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // CORS para el frontend (Vite)
  app.enableCors({
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
    credentials: true,
  });

  // ========= Seed de ADMIN (se crea sólo si no existe) =========
  try {
    const empleadosService = app.get(EmpleadosService);

    const adminEmail = process.env.SEED_ADMIN_EMAIL ?? 'admin@autorent.local';
    const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? 'Admin123!';
    const adminAvatar =
      process.env.ADMIN_DEFAULT_AVATAR ?? 'https://i.pravatar.cc/150?img=12';

    const existente = await empleadosService.findByEmail(adminEmail);
    if (!existente) {
      await empleadosService.create({
        nombres: 'Administrador',
        apellidos: 'Autorent',
        email: adminEmail,
        password: adminPassword, // el service debe hashear internamente
        rol: RolEmpleado.ADMIN,
        avatarUrl: adminAvatar,
      } as any);

      // eslint-disable-next-line no-console
      console.log('✅ Admin creado:', adminEmail);
    } else {
      // eslint-disable-next-line no-console
      console.log('ℹ️  Admin ya existe:', adminEmail);
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('❌ Error creando el admin seed:', e);
  }
  // ========= Fin seed =========

  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`🚀 API en http://localhost:${port} con prefijo /api`);
}

bootstrap();
