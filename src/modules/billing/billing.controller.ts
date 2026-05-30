import { Body, Controller, Headers, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import {
  ApiBody,
  ApiHeader,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { RevenueCatWebhookDto } from './dto/revenuecat-webhook.dto';
import { BillingService } from './billing.service';

@ApiTags('Billing')
@Controller('webhooks')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Post('revenuecat')
  @Throttle({ default: { ttl: 60000, limit: 50 } })
  @ApiOperation({ summary: 'Receive and verify RevenueCat webhook events' })
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer RevenueCat webhook secret',
  })
  @ApiBody({ type: RevenueCatWebhookDto })
  @ApiOkResponse({ description: 'Webhook accepted' })
  @ApiUnauthorizedResponse({
    description: 'Invalid or missing RevenueCat webhook secret',
  })
  handleRevenueCatWebhook(
    @Headers('authorization') authorization: string | undefined,
    @Body() dto: RevenueCatWebhookDto,
  ) {
    return this.billingService.handleRevenueCatWebhook(authorization, dto);
  }
}
