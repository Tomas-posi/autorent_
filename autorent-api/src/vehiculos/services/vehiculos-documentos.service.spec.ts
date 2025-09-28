import { Test, TestingModule } from '@nestjs/testing';
import { VehiculosDocumentosService } from '../services/vehiculos-documentos.service';

describe('VehiculosDocumentosService', () => {
  let service: VehiculosDocumentosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VehiculosDocumentosService],
    }).compile();

    service = module.get<VehiculosDocumentosService>(
      VehiculosDocumentosService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
