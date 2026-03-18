import { IsObject, IsOptional, IsString } from 'class-validator';

export class RevenueCatWebhookDto {
  @IsString()
  @IsOptional()
  api_version?: string;

  @IsObject()
  event: Record<string, unknown>;
}
