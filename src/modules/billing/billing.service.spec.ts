import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { PrismaService } from '../../prisma/prisma.service';
import { BillingService } from './billing.service';

describe('BillingService', () => {
  let service: BillingService;

  const prismaMock = {
    user: {
      updateMany: jest.fn(),
    },
  };

  const configServiceMock = {
    get: jest.fn((key: string) => {
      if (key === 'REVENUECAT_WEBHOOK_SECRET') {
        return 'test_htHFzeNliVsqNnGiWHCcHSEiFjZ';
      }

      return undefined;
    }),
    getOrThrow: jest.fn((key: string) => {
      if (key === 'REVENUECAT_WEBHOOK_SECRET') {
        return 'test_htHFzeNliVsqNnGiWHCcHSEiFjZ';
      }

      throw new Error(`Missing config key: ${key}`);
    }),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const moduleRef = await Test.createTestingModule({
      providers: [
        BillingService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: ConfigService, useValue: configServiceMock },
      ],
    }).compile();

    service = moduleRef.get(BillingService);
  });

  it('rejects webhook calls with an invalid secret', async () => {
    await expect(
      service.handleRevenueCatWebhook('Bearer wrong-secret', {
        event: {},
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('updates premium status when webhook secret and app user id match', async () => {
    prismaMock.user.updateMany.mockResolvedValue({ count: 1 });

    const result = await service.handleRevenueCatWebhook(
      'Bearer test_htHFzeNliVsqNnGiWHCcHSEiFjZ',
      {
        event: {
          app_user_id: 'device-1',
          expiration_at_ms: 1770000000000,
        },
      },
    );

    expect(prismaMock.user.updateMany).toHaveBeenCalled();
    expect(result).toEqual({
      received: true,
      appUserId: 'device-1',
    });
  });
});
