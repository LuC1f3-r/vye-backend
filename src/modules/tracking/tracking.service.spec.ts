import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PrismaService } from '../../prisma/prisma.service';
import { TrackingService } from './tracking.service';

describe('TrackingService', () => {
  let service: TrackingService;

  const prismaMock = {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    cycle: {
      findMany: jest.fn(),
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    dailyLog: {
      upsert: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const moduleRef = await Test.createTestingModule({
      providers: [
        TrackingService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = moduleRef.get(TrackingService);
  });

  it('builds summary values from stored cycles', async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: 'user-1',
      average_cycle: 28,
      average_period: 5,
    });
    prismaMock.cycle.findMany.mockResolvedValue([
      {
        start_date: new Date('2026-01-01T00:00:00.000Z'),
        end_date: new Date('2026-01-05T00:00:00.000Z'),
      },
      {
        start_date: new Date('2026-01-29T00:00:00.000Z'),
        end_date: new Date('2026-02-02T00:00:00.000Z'),
      },
    ]);

    const result = await service.getSummary('user-1');

    expect(result.averageCycle).toBe(28);
    expect(result.averagePeriod).toBe(5);
    expect(result.nextPredictedPeriodStart).toBe('2026-02-26T00:00:00.000Z');
    expect(result.fertileWindowStart).toBe('2026-02-07T00:00:00.000Z');
    expect(result.fertileWindowEnd).toBe('2026-02-12T00:00:00.000Z');
  });

  it('rejects cycle update when cycle does not belong to user', async () => {
    prismaMock.cycle.findFirst.mockResolvedValue(null);

    await expect(
      service.updateCycle('user-1', 'cycle-1', { endDate: '2026-03-16' }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('upserts batch daily logs', async () => {
    prismaMock.dailyLog.upsert.mockResolvedValue({ id: 'log-1' });

    const result = await service.batchLogs('user-1', {
      logs: [
        {
          date: '2026-03-16',
          flowLevel: 'LIGHT',
          mood: 'calm',
          symptoms: ['cramps'],
          temperature: 36.6,
          weight: 60.5,
          notes: 'Feeling okay',
        },
      ],
    });

    expect(prismaMock.dailyLog.upsert).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ accepted: 1, rejected: 0 });
  });

  it('requires an authenticated user', async () => {
    await expect(service.getCycles(undefined)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });
});
