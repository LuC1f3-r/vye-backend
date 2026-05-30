import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional } from 'class-validator';

export class UpdateCycleDto {
  @ApiPropertyOptional({ example: '2026-03-16' })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
