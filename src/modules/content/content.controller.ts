import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { ContentService } from './content.service';

@Controller('content')
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @Get()
  listContent() {
    return this.contentService.listPublishedContent();
  }

  @Get(':id/access')
  @UseGuards(JwtAuthGuard)
  getContentAccess(
    @CurrentUser() user: AuthenticatedUser | undefined,
    @Param('id') contentId: string,
  ) {
    return this.contentService.getContentAccess(user?.userId, contentId);
  }
}
