import { Body, Controller, Post } from '@nestjs/common';
import { RevenueCatWebhookDto } from './dto/revenuecat-webhook.dto';
import { BillingService } from './billing.service';

@Controller('webhooks')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Post('revenuecat')
  handleRevenueCatWebhook(@Body() dto: RevenueCatWebhookDto) {
    return this.billingService.handleRevenueCatWebhook(dto);
  }
}
