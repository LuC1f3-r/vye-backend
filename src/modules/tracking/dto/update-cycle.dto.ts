import { IsDateString, IsOptional } from 'class-validator';

export class UpdateCycleDto {
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
