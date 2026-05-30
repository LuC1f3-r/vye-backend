import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { PrismaService } from '../../prisma/prisma.service';
import { ContentService } from './content.service';

describe('ContentService', () => {
  let service: ContentService;

  const prismaMock = {
    user: {
      findUnique: jest.fn(),
    },
    content: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
  };

  const configServiceMock = {
    get: jest.fn((key: string, defaultValue?: string) => {
      if (key === 'AWS_REGION') {
        return defaultValue ?? 'auto';
      }

      if (key === 'S3_BUCKET') {
        return 'vye-storage';
      }

      if (key === 'R2_ENDPOINT') {
        return 'https://example.r2.cloudflarestorage.com';
      }

      if (key === 'S3_ACCESS_KEY_ID') {
        return 'mock-r2-access-key-id';
      }

      if (key === 'S3_SECRET_ACCESS_KEY') {
        return 'mock-r2-secret-access-key';
      }

      return undefined;
    }),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const moduleRef = await Test.createTestingModule({
      providers: [
        ContentService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: ConfigService, useValue: configServiceMock },
      ],
    }).compile();

    service = moduleRef.get(ContentService);
  });

  it('returns a signed URL when R2 credentials are configured', async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: 'user-1',
      is_premium: true,
    });
    prismaMock.content.findUnique.mockResolvedValue({
      id: 'content-1',
      is_premium: true,
      media_url: 'videos/hormones-energy.mp4',
    });

    const result = await service.getContentAccess('user-1', 'content-1');

    expect(result.allowed).toBe(true);
    expect(result.expiresIn).toBe(900);
    expect(result.mediaUrl).toContain(
      'https://example.r2.cloudflarestorage.com',
    );
    expect(result.mediaUrl).toContain('vye-storage');
    expect(result.mediaUrl).toContain('videos/hormones-energy.mp4');
  });
});
