import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { AnonymousAuthDto } from './dto/anonymous-auth.dto';
import { AttachAccountDto } from './dto/attach-account.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthenticatedUser } from './interfaces/authenticated-user.interface';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('anonymous')
  createAnonymousSession(@Body() dto: AnonymousAuthDto) {
    return this.authService.createAnonymousSession(dto);
  }

  @Post('attach-account')
  @UseGuards(JwtAuthGuard)
  attachAccount(
    @CurrentUser() user: AuthenticatedUser | undefined,
    @Body() dto: AttachAccountDto,
  ) {
    return this.authService.attachAccount(user?.userId, dto);
  }
}
