import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
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

@ApiTags('Tracking')
@Controller()
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token' })
export class TrackingController {
  constructor(private readonly trackingService: TrackingService) {}

  @Get('cycles')
  @ApiOperation({ summary: 'List cycles for the authenticated user' })
  @ApiOkResponse({ description: 'Cycle history returned' })
  getCycles(@CurrentUser() user: AuthenticatedUser | undefined) {
    return this.trackingService.getCycles(user?.userId);
  }

  @Get('cycles/summary')
  @ApiOperation({ summary: 'Get derived cycle summary and prediction values' })
  @ApiOkResponse({ description: 'Cycle summary returned' })
  getSummary(@CurrentUser() user: AuthenticatedUser | undefined) {
    return this.trackingService.getSummary(user?.userId);
  }

  @Post('cycles')
  @ApiOperation({ summary: 'Create a cycle start record' })
  @ApiBody({ type: CreateCycleDto })
  @ApiOkResponse({ description: 'Cycle created' })
  createCycle(
    @CurrentUser() user: AuthenticatedUser | undefined,
    @Body() dto: CreateCycleDto,
  ) {
    return this.trackingService.createCycle(user?.userId, dto);
  }

  @Patch('cycles/:id')
  @ApiOperation({ summary: 'Update a cycle, typically to set period end date' })
  @ApiBody({ type: UpdateCycleDto })
  @ApiOkResponse({ description: 'Cycle updated' })
  updateCycle(
    @CurrentUser() user: AuthenticatedUser | undefined,
    @Param('id') cycleId: string,
    @Body() dto: UpdateCycleDto,
  ) {
    return this.trackingService.updateCycle(user?.userId, cycleId, dto);
  }

  @Post('logs/batch')
  @ApiOperation({ summary: 'Upsert a batch of daily logs from offline sync' })
  @ApiBody({ type: BatchLogDto })
  @ApiOkResponse({ description: 'Batch sync accepted' })
  batchLogs(
    @CurrentUser() user: AuthenticatedUser | undefined,
    @Body() dto: BatchLogDto,
  ) {
    return this.trackingService.batchLogs(user?.userId, dto);
  }
}
