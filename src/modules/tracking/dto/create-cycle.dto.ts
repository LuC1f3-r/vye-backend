import { IsBoolean, IsDateString } from 'class-validator';

export class CreateCycleDto {
  @IsDateString()
  startDate: string;

  @IsBoolean()
  isPredicted: boolean;
}
