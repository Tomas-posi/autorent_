import { Test, TestingModule } from '@nestjs/testing';
import { VehiculosDocumentosController } from './vehiculos-documentos.controller';
import { beforeEach, describe, it, expect } from '@jest/globals';

describe('VehiculosDocumentosController', () => {
  let controller: VehiculosDocumentosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VehiculosDocumentosController],
    }).compile();

    controller = module.get<VehiculosDocumentosController>(
      VehiculosDocumentosController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
