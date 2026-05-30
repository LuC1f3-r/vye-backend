import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateMeDto } from './dto/update-me.dto';
import { UpsertReminderDto } from './dto/upsert-reminder.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getMe(userId: string | undefined) {
    const id = this.assertUserId(userId);

    const [user, reminders] = await Promise.all([
      this.prisma.user.findUnique({ where: { id } }),
      this.prisma.reminder.findMany({
        where: { user_id: id },
        orderBy: [{ type: 'asc' }, { time_utc: 'asc' }],
      }),
    ]);

    if (!user) {
      throw new BadRequestException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      averageCycle: user.average_cycle,
      averagePeriod: user.average_period,
      isPremium: user.is_premium,
      premiumExpiry: user.premium_expiry,
      reminders: reminders.map((reminder) => ({
        id: reminder.id,
        type: reminder.type,
        timeUtc: reminder.time_utc,
        isActive: reminder.is_active,
      })),
    };
  }

  async updateMe(userId: string | undefined, dto: UpdateMeDto) {
    const id = this.assertUserId(userId);

    if (dto.email) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });

      if (existingUser && existingUser.id !== id) {
        throw new BadRequestException(
          'Email is already attached to another account',
        );
      }
    }

    const user = await this.prisma.user.update({
      where: { id },
      data: {
        email: dto.email,
        average_cycle: dto.averageCycle,
        average_period: dto.averagePeriod,
      },
    });

    return {
      id: user.id,
      email: user.email,
      averageCycle: user.average_cycle,
      averagePeriod: user.average_period,
      isPremium: user.is_premium,
      premiumExpiry: user.premium_expiry,
    };
  }

  async getReminderSettings(userId: string | undefined) {
    const id = this.assertUserId(userId);

    return this.prisma.reminder.findMany({
      where: { user_id: id },
      orderBy: [{ type: 'asc' }, { time_utc: 'asc' }],
    });
  }

  async upsertReminder(userId: string | undefined, dto: UpsertReminderDto) {
    const id = this.assertUserId(userId);

    const existingReminder = await this.prisma.reminder.findFirst({
      where: { user_id: id, type: dto.type },
    });

    if (existingReminder) {
      return this.prisma.reminder.update({
        where: { id: existingReminder.id },
        data: {
          time_utc: new Date(dto.timeUtc),
          is_active: dto.isActive,
        },
      });
    }

    return this.prisma.reminder.create({
      data: {
        user_id: id,
        type: dto.type,
        time_utc: new Date(dto.timeUtc),
        is_active: dto.isActive,
      },
    });
  }

  private assertUserId(userId: string | undefined) {
    if (!userId) {
      throw new BadRequestException(
        'Authenticated user is required for this endpoint',
      );
    }

    return userId;
  }
}
