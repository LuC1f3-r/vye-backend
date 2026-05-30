import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { FlowLevel } from '@prisma/client';
import { Type } from 'class-transformer';

class BatchLogItemDto {
  @ApiProperty({ example: '2026-03-16' })
  @IsDateString()
  date: string;

  @ApiPropertyOptional({ enum: FlowLevel, example: FlowLevel.LIGHT })
  @IsOptional()
  @IsEnum(FlowLevel)
  flowLevel?: FlowLevel;

  @ApiPropertyOptional({ example: 'calm' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  mood?: string;

  @ApiPropertyOptional({ example: ['cramps', 'bloating'], type: [String] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(50)
  @IsString({ each: true })
  @MaxLength(100, { each: true })
  symptoms?: string[];

  @ApiPropertyOptional({ example: 36.6 })
  @IsOptional()
  @IsNumber()
  @Min(34.0)
  @Max(43.0)
  temperature?: number;

  @ApiPropertyOptional({ example: 60.5 })
  @IsOptional()
  @IsNumber()
  @Min(20.0)
  @Max(500.0)
  weight?: number;

  @ApiPropertyOptional({ example: 'Feeling okay' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}

export class BatchLogDto {
  @ApiProperty({ type: [BatchLogItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(366)
  @ValidateNested({ each: true })
  @Type(() => BatchLogItemDto)
  logs: BatchLogItemDto[];
}
