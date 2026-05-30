import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsInt, IsOptional, Max, Min } from 'class-validator';

export class UpdateMeDto {
  @ApiPropertyOptional({ example: 'user@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: 29, minimum: 20, maximum: 60 })
  @IsOptional()
  @IsInt()
  @Min(20)
  @Max(60)
  averageCycle?: number;

  @ApiPropertyOptional({ example: 5, minimum: 1, maximum: 14 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(14)
  averagePeriod?: number;
}
