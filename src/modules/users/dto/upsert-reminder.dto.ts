import { ApiProperty } from '@nestjs/swagger';
import { ReminderType } from '@prisma/client';
import { IsBoolean, IsDateString, IsEnum } from 'class-validator';

export class UpsertReminderDto {
  @ApiProperty({ enum: ReminderType, example: ReminderType.DAILY_LOG })
  @IsEnum(ReminderType)
  type: ReminderType;

  @ApiProperty({ example: '2026-03-19T09:00:00.000Z' })
  @IsDateString()
  timeUtc: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  isActive: boolean;
}
