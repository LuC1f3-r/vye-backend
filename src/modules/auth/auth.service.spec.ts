import { BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { hash } from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthService } from './auth.service';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;

  const prismaMock = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  const jwtServiceMock = {
    signAsync: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: JwtService, useValue: jwtServiceMock },
      ],
    }).compile();

    service = moduleRef.get(AuthService);
  });

  it('reuses an existing anonymous user for the same install id', async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: 'user-1',
      email: null,
      is_premium: false,
      average_cycle: 28,
      average_period: 5,
    });
    jwtServiceMock.signAsync.mockResolvedValue('jwt-token');

    const result = await service.createAnonymousSession({
      deviceId: '4cdd48c8-6d1e-4d5d-8034-4ef178ef6f83',
      platform: 'android',
      appVersion: '0.1.0',
    });

    expect(prismaMock.user.create).not.toHaveBeenCalled();
    expect(result.accessToken).toBe('jwt-token');
    expect(result.user.id).toBe('user-1');
  });

  it('creates a new anonymous user when install id is unknown', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);
    prismaMock.user.create.mockResolvedValue({
      id: 'user-2',
      email: null,
      is_premium: false,
      average_cycle: 28,
      average_period: 5,
    });
    jwtServiceMock.signAsync.mockResolvedValue('jwt-token');

    await service.createAnonymousSession({
      deviceId: '4cdd48c8-6d1e-4d5d-8034-4ef178ef6f83',
      platform: 'android',
    });

    expect(prismaMock.user.create).toHaveBeenCalledWith({
      data: {
        anonymous_install_id: '4cdd48c8-6d1e-4d5d-8034-4ef178ef6f83',
        revenuecat_app_user_id: '4cdd48c8-6d1e-4d5d-8034-4ef178ef6f83',
      },
    });
  });

  it('prevents attaching an email that belongs to another user', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ id: 'other-user' });

    await expect(
      service.attachAccount('user-1', {
        email: 'taken@example.com',
        password: 'password123',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('attaches account details to the authenticated anonymous user', async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce(null);
    (hash as jest.Mock).mockResolvedValue('hashed-password');
    prismaMock.user.update.mockResolvedValue({
      id: 'user-1',
      email: 'user@example.com',
      anonymous_install_id: 'install-1',
      is_premium: false,
      average_cycle: 28,
      average_period: 5,
    });
    jwtServiceMock.signAsync.mockResolvedValue('jwt-token');

    const result = await service.attachAccount('user-1', {
      email: 'user@example.com',
      password: 'password123',
    });

    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: {
        email: 'user@example.com',
        password_hash: 'hashed-password',
      },
    });
    expect(result.accessToken).toBe('jwt-token');
  });
});
