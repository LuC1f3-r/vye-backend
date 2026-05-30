import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Body, Controller, Get, Patch, Put, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { UpdateMeDto } from './dto/update-me.dto';
import { UpsertReminderDto } from './dto/upsert-reminder.dto';
import { UsersService } from './users.service';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token' })
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile and reminder summary' })
  @ApiOkResponse({ description: 'Current user returned' })
  getMe(@CurrentUser() user: AuthenticatedUser | undefined) {
    return this.usersService.getMe(user?.userId);
  }

  @Patch('me')
  @ApiOperation({
    summary: 'Update current user profile values used by the mobile app',
  })
  @ApiBody({ type: UpdateMeDto })
  @ApiOkResponse({ description: 'Current user updated' })
  updateMe(
    @CurrentUser() user: AuthenticatedUser | undefined,
    @Body() dto: UpdateMeDto,
  ) {
    return this.usersService.updateMe(user?.userId, dto);
  }

  @Get('me/reminders')
  @ApiOperation({ summary: 'Get reminder preferences for the current user' })
  @ApiOkResponse({ description: 'Reminder settings returned' })
  getReminderSettings(@CurrentUser() user: AuthenticatedUser | undefined) {
    return this.usersService.getReminderSettings(user?.userId);
  }

  @Put('me/reminders')
  @ApiOperation({
    summary: 'Create or update a reminder setting for the current user',
  })
  @ApiBody({ type: UpsertReminderDto })
  @ApiOkResponse({ description: 'Reminder created or updated' })
  upsertReminder(
    @CurrentUser() user: AuthenticatedUser | undefined,
    @Body() dto: UpsertReminderDto,
  ) {
    return this.usersService.upsertReminder(user?.userId, dto);
  }
}
