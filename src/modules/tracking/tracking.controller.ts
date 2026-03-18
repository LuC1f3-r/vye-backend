import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { BatchLogDto } from './dto/batch-log.dto';
import { CreateCycleDto } from './dto/create-cycle.dto';
import { UpdateCycleDto } from './dto/update-cycle.dto';
import { TrackingService } from './tracking.service';

@Controller()
@UseGuards(JwtAuthGuard)
export class TrackingController {
  constructor(private readonly trackingService: TrackingService) {}

  @Get('cycles')
  getCycles(@CurrentUser() user: AuthenticatedUser | undefined) {
    return this.trackingService.getCycles(user?.userId);
  }

  @Get('cycles/summary')
  getSummary(@CurrentUser() user: AuthenticatedUser | undefined) {
    return this.trackingService.getSummary(user?.userId);
  }

  @Post('cycles')
  createCycle(
    @CurrentUser() user: AuthenticatedUser | undefined,
    @Body() dto: CreateCycleDto,
  ) {
    return this.trackingService.createCycle(user?.userId, dto);
  }

  @Patch('cycles/:id')
  updateCycle(
    @CurrentUser() user: AuthenticatedUser | undefined,
    @Param('id') cycleId: string,
    @Body() dto: UpdateCycleDto,
  ) {
    return this.trackingService.updateCycle(user?.userId, cycleId, dto);
  }

  @Post('logs/batch')
  batchLogs(
    @CurrentUser() user: AuthenticatedUser | undefined,
    @Body() dto: BatchLogDto,
  ) {
    return this.trackingService.batchLogs(user?.userId, dto);
  }
}
