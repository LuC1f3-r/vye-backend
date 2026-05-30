import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, IsUUID, Length } from 'class-validator';

export class AnonymousAuthDto {
  @ApiProperty({ example: '11111111-1111-1111-1111-111111111111' })
  @IsUUID()
  deviceId: string;

  @ApiProperty({ example: 'android', enum: ['ios', 'android'] })
  @IsString()
  @IsIn(['ios', 'android'])
  platform: 'ios' | 'android';

  @ApiPropertyOptional({ example: '0.1.0' })
  @IsOptional()
  @IsString()
  @Length(1, 32)
  appVersion?: string;
}
