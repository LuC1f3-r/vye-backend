import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsDateString } from 'class-validator';

export class CreateCycleDto {
  @ApiProperty({ example: '2026-03-12' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: false })
  @IsBoolean()
  isPredicted: boolean;
}
