import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ContentService {
  constructor(private readonly prisma: PrismaService) {}

  async listPublishedContent() {
    return this.prisma.content.findMany({
      where: { is_published: true },
      orderBy: { published_at: 'desc' },
    });
  }

  async getContentAccess(userId: string | undefined, contentId: string) {
    if (!userId) {
      throw new BadRequestException(
        'x-user-id header is required for MVP endpoints',
      );
    }

    const [user, content] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: userId } }),
      this.prisma.content.findUnique({ where: { id: contentId } }),
    ]);

    if (!user || !content) {
      throw new BadRequestException('User or content not found');
    }

    const allowed = !content.is_premium || user.is_premium;

    return {
      allowed,
      expiresIn: allowed ? 900 : null,
      mediaUrl: allowed ? content.media_url : null,
    };
  }
}
