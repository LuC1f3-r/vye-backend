import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ContentService {
  private readonly signingExpiresIn = 900;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async listPublishedContent() {
    return this.prisma.content.findMany({
      where: { is_published: true },
      orderBy: { published_at: 'desc' },
    });
  }

  async getContentAccess(userId: string | undefined, contentId: string) {
    if (!userId) {
      throw new BadRequestException(
        'Authenticated user is required for this endpoint',
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

    const mediaUrl = allowed
      ? await this.resolveMediaUrl(content.media_url)
      : null;

    return {
      allowed,
      expiresIn: allowed ? this.signingExpiresIn : null,
      mediaUrl,
    };
  }

  private async resolveMediaUrl(objectKey: string) {
    const bucket = this.configService.get<string>('S3_BUCKET');
    const endpoint = this.configService.get<string>('R2_ENDPOINT');
    const accessKeyId = this.configService.get<string>('S3_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>(
      'S3_SECRET_ACCESS_KEY',
    );

    if (
      !bucket ||
      !endpoint ||
      !accessKeyId ||
      !secretAccessKey ||
      accessKeyId === 'replace-me' ||
      secretAccessKey === 'replace-me'
    ) {
      return objectKey;
    }

    const client = new S3Client({
      region: this.configService.get<string>('AWS_REGION', 'auto'),
      endpoint,
      forcePathStyle: true,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });

    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: this.normalizeObjectKey(objectKey),
    });

    return getSignedUrl(client, command, { expiresIn: this.signingExpiresIn });
  }

  private normalizeObjectKey(value: string) {
    try {
      const parsed = new URL(value);
      return parsed.pathname.replace(/^\//, '');
    } catch {
      return value.replace(/^\//, '');
    }
  }
}
