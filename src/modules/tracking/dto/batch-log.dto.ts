import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { FlowLevel } from '@prisma/client';
import { Type } from 'class-transformer';

class BatchLogItemDto {
  @IsDateString()
  date: string;

  @IsOptional()
  @IsEnum(FlowLevel)
  flowLevel?: FlowLevel;

  @IsOptional()
  @IsString()
  mood?: string;

  @IsOptional()
  @IsArray()
  symptoms?: string[];

  @IsOptional()
  @IsNumber()
  temperature?: number;

  @IsOptional()
  @IsNumber()
  weight?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class BatchLogDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => BatchLogItemDto)
  logs: BatchLogItemDto[];
}
