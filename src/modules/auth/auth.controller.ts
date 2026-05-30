import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { AnonymousAuthDto } from './dto/anonymous-auth.dto';
import { AttachAccountDto } from './dto/attach-account.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthenticatedUser } from './interfaces/authenticated-user.interface';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('anonymous')
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @ApiOperation({ summary: 'Bootstrap an anonymous install-scoped session' })
  @ApiBody({ type: AnonymousAuthDto })
  @ApiCreatedResponse({ description: 'Anonymous session created or reused' })
  createAnonymousSession(@Body() dto: AnonymousAuthDto) {
    return this.authService.createAnonymousSession(dto);
  }

  @Post('attach-account')
  @Throttle({ default: { ttl: 60000, limit: 3 } })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Attach email and password to the current anonymous user',
  })
  @ApiBody({ type: AttachAccountDto })
  @ApiCreatedResponse({
    description: 'Account upgraded from anonymous to registered',
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token' })
  attachAccount(
    @CurrentUser() user: AuthenticatedUser | undefined,
    @Body() dto: AttachAccountDto,
  ) {
    return this.authService.attachAccount(user?.userId, dto);
  }
}
