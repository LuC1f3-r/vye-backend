import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { hash } from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { AnonymousAuthDto } from './dto/anonymous-auth.dto';
import { AttachAccountDto } from './dto/attach-account.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async createAnonymousSession(dto: AnonymousAuthDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { anonymous_install_id: dto.deviceId },
    });

    const user =
      existingUser ??
      (await this.prisma.user.create({
        data: {
          anonymous_install_id: dto.deviceId,
          revenuecat_app_user_id: dto.deviceId,
        },
      }));

    return {
      user: this.serializeUser(user),
      accessToken: await this.signToken(user.id, dto.deviceId),
    };
  }

  async attachAccount(userId: string | undefined, dto: AttachAccountDto) {
    if (!userId) {
      throw new BadRequestException(
        'Authenticated user is required for attach-account flow',
      );
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existingUser && existingUser.id !== userId) {
      throw new BadRequestException('This email address cannot be used');
    }

    const passwordHash = await hash(dto.password, 12);
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        email: dto.email,
        password_hash: passwordHash,
      },
    });

    return {
      user: this.serializeUser(user),
      accessToken: await this.signToken(
        user.id,
        user.anonymous_install_id ?? user.id,
      ),
    };
  }

  private async signToken(userId: string, deviceId: string) {
    return this.jwtService.signAsync({ sub: userId, deviceId, scope: 'mvp' });
  }

  private serializeUser(user: User) {
    return {
      id: user.id,
      email: user.email,
      isPremium: user.is_premium,
      averageCycle: user.average_cycle,
      averagePeriod: user.average_period,
    };
  }
}
