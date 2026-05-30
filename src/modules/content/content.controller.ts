import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { ContentService } from './content.service';

@ApiTags('Content')
@Controller('content')
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @Get()
  @ApiOperation({ summary: 'List published content cards for the learn tab' })
  @ApiOkResponse({ description: 'Published content returned' })
  listContent() {
    return this.contentService.listPublishedContent();
  }

  @Get(':id/access')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Resolve access state and media URL for a content item',
  })
  @ApiOkResponse({ description: 'Content access state returned' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token' })
  getContentAccess(
    @CurrentUser() user: AuthenticatedUser | undefined,
    @Param('id') contentId: string,
  ) {
    return this.contentService.getContentAccess(user?.userId, contentId);
  }
}
