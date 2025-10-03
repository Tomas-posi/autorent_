import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';
import { TipoVehiculoDocumento } from '../entities/vehiculo-documento.entity';

export class CreateVehiculoDocumentoDto {
  @IsEnum(TipoVehiculoDocumento)
  @IsOptional()
  tipo?: TipoVehiculoDocumento;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  nombreOriginal: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  nombreArchivo: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  mimeType: string;

  @IsPositive()
  tamano: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  urlArchivo: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notas?: string;
}
