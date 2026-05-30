import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class RevenueCatEventDto {
  @ApiPropertyOptional({ example: 'evt_abc123' })
  @IsOptional()
  @IsString()
  @MaxLength(256)
  id?: string;

  @ApiPropertyOptional({ example: 'INITIAL_PURCHASE' })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  type?: string;

  @ApiPropertyOptional({ example: '11111111-1111-1111-1111-111111111111' })
  @IsOptional()
  @IsString()
  @MaxLength(256)
  app_user_id?: string;

  @ApiPropertyOptional({ example: 1770000000000 })
  @IsOptional()
  @IsNumber()
  expiration_at_ms?: number;

  @ApiPropertyOptional({ example: 1770000000000 })
  @IsOptional()
  @IsNumber()
  event_at_ms?: number;
}

export class RevenueCatWebhookDto {
  @ApiPropertyOptional({ example: '1.0' })
  @IsString()
  @IsOptional()
  @MaxLength(16)
  api_version?: string;

  @ApiProperty()
  @IsObject()
  @ValidateNested()
  @Type(() => RevenueCatEventDto)
  event: RevenueCatEventDto;
}
