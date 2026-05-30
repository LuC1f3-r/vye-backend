import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { RevenueCatWebhookDto } from './dto/revenuecat-webhook.dto';

const REPLAY_WINDOW_MS = 5 * 60 * 1000; // 5 minutes

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async handleRevenueCatWebhook(
    authorization: string | undefined,
    dto: RevenueCatWebhookDto,
  ) {
    this.assertWebhookSecret(authorization);

    // Layer 1: Timestamp freshness — reject events older than 5 minutes
    const eventAtMs = dto.event.event_at_ms;
    if (eventAtMs !== undefined) {
      const age = Date.now() - eventAtMs;
      if (age > REPLAY_WINDOW_MS) {
        this.logger.warn(
          `Rejected stale RevenueCat event: age=${age}ms, event_at_ms=${eventAtMs}`,
        );
        return { received: true, stale: true };
      }
    }

    // Layer 2: Event ID idempotency — skip duplicate events
    const eventId = dto.event.id;
    if (eventId) {
      const existing = await this.prisma.processedWebhookEvent.findUnique({
        where: { event_id: eventId },
      });
      if (existing) {
        this.logger.log(`Duplicate RevenueCat event ignored: id=${eventId}`);
        return { received: true, duplicate: true };
      }

      // Insert before processing to claim this event
      try {
        await this.prisma.processedWebhookEvent.create({
          data: { event_id: eventId },
        });
      } catch {
        // Unique constraint violation: another worker processed it first
        this.logger.log(`Race condition on event id=${eventId}, skipping`);
        return { received: true, duplicate: true };
      }
    }

    this.logger.log(
      `Processing RevenueCat event: id=${eventId ?? 'unknown'}, type=${dto.event.type ?? 'unknown'}`,
    );

    const appUserId = dto.event.app_user_id;
    const expirationAtMs = dto.event.expiration_at_ms;

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

  private assertWebhookSecret(authorization: string | undefined) {
    const expectedSecret = this.configService.getOrThrow<string>(
      'REVENUECAT_WEBHOOK_SECRET',
    );

    const token = authorization?.startsWith('Bearer ')
      ? authorization.slice('Bearer '.length)
      : authorization;

    if (token !== expectedSecret) {
      throw new UnauthorizedException('Invalid RevenueCat webhook secret');
    }
  }
}
