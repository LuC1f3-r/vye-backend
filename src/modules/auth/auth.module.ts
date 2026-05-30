import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        // No fallback — ConfigModule Joi validation guarantees JWT_SECRET is present
        secret: configService.getOrThrow<string>('JWT_SECRET'),
        signOptions: {
          // Cast needed: @nestjs/jwt types expiresIn as StringValue (ms package)
          expiresIn: configService.get<string>(
            'JWT_EXPIRY',
            '15m',
          ) as unknown as undefined,
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
