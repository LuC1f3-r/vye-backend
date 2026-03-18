import { IsIn, IsOptional, IsString, IsUUID, Length } from 'class-validator';

export class AnonymousAuthDto {
  @IsUUID()
  deviceId: string;

  @IsString()
  @IsIn(['ios', 'android'])
  platform: 'ios' | 'android';

  @IsOptional()
  @IsString()
  @Length(1, 32)
  appVersion?: string;
}
