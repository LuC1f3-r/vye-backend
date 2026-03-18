import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { BatchLogDto } from './dto/batch-log.dto';
import { CreateCycleDto } from './dto/create-cycle.dto';
import { UpdateCycleDto } from './dto/update-cycle.dto';

@Injectable()
export class TrackingService {
  constructor(private readonly prisma: PrismaService) {}

  async getCycles(userId: string | undefined) {
    this.assertUserId(userId);

    return this.prisma.cycle.findMany({
      where: { user_id: userId },
      orderBy: { start_date: 'desc' },
    });
  }

  async getSummary(userId: string | undefined) {
    this.assertUserId(userId);

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const cycles = await this.prisma.cycle.findMany({
      where: { user_id: userId, is_predicted: false },
      orderBy: { start_date: 'asc' },
      select: { start_date: true, end_date: true },
    });

    const summary = this.buildCycleSummary(
      cycles,
      user.average_cycle,
      user.average_period,
    );

    return summary;
  }

  async createCycle(userId: string | undefined, dto: CreateCycleDto) {
    this.assertUserId(userId);

    const cycle = await this.prisma.cycle.create({
      data: {
        user_id: userId,
        start_date: new Date(dto.startDate),
        is_predicted: dto.isPredicted,
      },
    });

    await this.syncUserAverages(userId);

    return cycle;
  }

  async updateCycle(
    userId: string | undefined,
    cycleId: string,
    dto: UpdateCycleDto,
  ) {
    this.assertUserId(userId);

    const cycle = await this.prisma.cycle.findFirst({
      where: { id: cycleId, user_id: userId },
    });
    if (!cycle) {
      throw new NotFoundException('Cycle not found');
    }

    const updatedCycle = await this.prisma.cycle.update({
      where: { id: cycleId },
      data: {
        end_date: dto.endDate ? new Date(dto.endDate) : undefined,
      },
    });

    await this.syncUserAverages(userId);

    return updatedCycle;
  }

  async batchLogs(userId: string | undefined, dto: BatchLogDto) {
    this.assertUserId(userId);

    const results = await Promise.all(
      dto.logs.map((log) =>
        this.prisma.dailyLog.upsert({
          where: {
            user_id_date: {
              user_id: userId,
              date: new Date(log.date),
            },
          },
          update: {
            flow_level: log.flowLevel,
            mood: log.mood,
            symptoms: log.symptoms,
            temperature: log.temperature,
            weight: log.weight,
            notes: log.notes,
          },
          create: {
            user_id: userId,
            date: new Date(log.date),
            flow_level: log.flowLevel,
            mood: log.mood,
            symptoms: log.symptoms,
            temperature: log.temperature,
            weight: log.weight,
            notes: log.notes,
          },
        }),
      ),
    );

    return {
      accepted: results.length,
      rejected: 0,
    };
  }

  private assertUserId(userId: string | undefined): asserts userId is string {
    if (!userId) {
      throw new BadRequestException(
        'Authenticated user is required for this endpoint',
      );
    }
  }

  private buildCycleSummary(
    cycles: { start_date: Date; end_date: Date | null }[],
    fallbackAverageCycle: number,
    fallbackAveragePeriod: number,
  ) {
    const cycleLengths: number[] = [];
    const periodLengths: number[] = [];

    for (let index = 1; index < cycles.length; index += 1) {
      const previous = cycles[index - 1];
      const current = cycles[index];
      const diffDays = this.diffInDays(previous.start_date, current.start_date);
      if (diffDays > 0) {
        cycleLengths.push(diffDays);
      }
    }

    for (const cycle of cycles) {
      if (cycle.end_date) {
        const days = this.diffInDays(cycle.start_date, cycle.end_date) + 1;
        if (days > 0) {
          periodLengths.push(days);
        }
      }
    }

    const averageCycle = this.average(cycleLengths) ?? fallbackAverageCycle;
    const averagePeriod = this.average(periodLengths) ?? fallbackAveragePeriod;
    const latestCycle = cycles.at(-1);

    if (!latestCycle) {
      return {
        averageCycle,
        averagePeriod,
        nextPredictedPeriodStart: null,
        fertileWindowStart: null,
        fertileWindowEnd: null,
      };
    }

    const nextPredictedPeriodStart = this.addDays(
      latestCycle.start_date,
      averageCycle,
    );
    const ovulationDate = this.addDays(nextPredictedPeriodStart, -14);
    const fertileWindowStart = this.addDays(ovulationDate, -5);
    const fertileWindowEnd = ovulationDate;

    return {
      averageCycle,
      averagePeriod,
      nextPredictedPeriodStart: nextPredictedPeriodStart.toISOString(),
      fertileWindowStart: fertileWindowStart.toISOString(),
      fertileWindowEnd: fertileWindowEnd.toISOString(),
    };
  }

  private async syncUserAverages(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return;
    }

    const cycles = await this.prisma.cycle.findMany({
      where: { user_id: userId, is_predicted: false },
      orderBy: { start_date: 'asc' },
      select: { start_date: true, end_date: true },
    });

    const summary = this.buildCycleSummary(
      cycles,
      user.average_cycle,
      user.average_period,
    );

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        average_cycle: summary.averageCycle,
        average_period: summary.averagePeriod,
      },
    });
  }

  private average(values: number[]) {
    if (values.length === 0) {
      return null;
    }

    const total = values.reduce((sum, value) => sum + value, 0);
    return Math.round(total / values.length);
  }

  private diffInDays(start: Date, end: Date) {
    const millisecondsPerDay = 1000 * 60 * 60 * 24;
    return Math.round((end.getTime() - start.getTime()) / millisecondsPerDay);
  }

  private addDays(date: Date, days: number) {
    const next = new Date(date);
    next.setUTCDate(next.getUTCDate() + days);
    return next;
  }
}
