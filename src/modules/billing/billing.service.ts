import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RevenueCatWebhookDto } from './dto/revenuecat-webhook.dto';

@Injectable()
export class BillingService {
  constructor(private readonly prisma: PrismaService) {}

  async handleRevenueCatWebhook(dto: RevenueCatWebhookDto) {
    const appUserId = this.getString(dto.event.app_user_id);
    const expirationAtMs = this.getNumber(dto.event.expiration_at_ms);

    if (appUserId) {
      await this.prisma.user.updateMany({
        where: {
          OR: [{ revenuecat_app_user_id: appUserId }, { id: appUserId }],
        },
        data: {
          is_premium: true,
          premium_expiry: expirationAtMs ? new Date(expirationAtMs) : undefined,
        },
      });
    }

    return {
      received: true,
      appUserId,
    };
  }

  private getString(value: unknown) {
    return typeof value === 'string' ? value : null;
  }

  private getNumber(value: unknown) {
    return typeof value === 'number' ? value : null;
  }
}
