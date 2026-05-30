import { BadRequestException } from '@nestjs/common';
import { ReminderType } from '@prisma/client';
import { Test } from '@nestjs/testing';
import { PrismaService } from '../../prisma/prisma.service';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;

  const prismaMock = {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    reminder: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const moduleRef = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = moduleRef.get(UsersService);
  });

  it('returns current user profile and reminders', async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: 'user-1',
      email: 'user@example.com',
      average_cycle: 29,
      average_period: 5,
      is_premium: false,
      premium_expiry: null,
    });
    prismaMock.reminder.findMany.mockResolvedValue([
      {
        id: 'reminder-1',
        type: ReminderType.DAILY_LOG,
        time_utc: new Date('2026-03-19T09:00:00.000Z'),
        is_active: true,
      },
    ]);

    const result = await service.getMe('user-1');

    expect(result.email).toBe('user@example.com');
    expect(result.reminders).toHaveLength(1);
  });

  it('prevents updating email to an already-used address', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ id: 'other-user' });

    await expect(
      service.updateMe('user-1', { email: 'taken@example.com' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('creates a reminder when none exists for the type', async () => {
    prismaMock.reminder.findFirst.mockResolvedValue(null);
    prismaMock.reminder.create.mockResolvedValue({ id: 'reminder-1' });

    await service.upsertReminder('user-1', {
      type: ReminderType.PERIOD_START,
      timeUtc: '2026-03-19T09:00:00.000Z',
      isActive: true,
    });

    expect(prismaMock.reminder.create).toHaveBeenCalled();
  });
});
