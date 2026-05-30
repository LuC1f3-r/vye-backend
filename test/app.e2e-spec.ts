import 'dotenv/config';

import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaClient } from '@prisma/client';
import request from 'supertest';
import { App } from 'supertest/types';
import { randomUUID } from 'crypto';
import { AppModule } from './../src/app.module';

describe('Vye MVP API (e2e)', () => {
  let app: INestApplication<App>;
  const prisma = new PrismaClient();

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('v1');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );

    await app.init();
  });

  jest.setTimeout(15000);

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  it('/v1/health (GET)', () => {
    return request(app.getHttpServer())
      .get('/v1/health')
      .expect(200)
      .expect((response) => {
        expect(response.body).toEqual(
          expect.objectContaining({
            status: 'ok',
            service: 'vye-backend',
            scope: 'mvp',
          }),
        );
      });
  });

  it('bootstraps anonymous auth, creates cycle and upserts batch logs', async () => {
    const installId = randomUUID();

    const authResponse = await request(app.getHttpServer())
      .post('/v1/auth/anonymous')
      .send({
        deviceId: installId,
        platform: 'android',
        appVersion: '0.1.0',
      })
      .expect(201);

    const { accessToken, user } = authResponse.body as {
      accessToken: string;
      user: { id: string };
    };

    expect(accessToken).toBeTruthy();
    expect(user.id).toBeTruthy();

    const secondAuthResponse = await request(app.getHttpServer())
      .post('/v1/auth/anonymous')
      .send({
        deviceId: installId,
        platform: 'android',
      })
      .expect(201);

    const secondAuthBody = secondAuthResponse.body as { user: { id: string } };
    expect(secondAuthBody.user.id).toBe(user.id);

    const createCycleResponse = await request(app.getHttpServer())
      .post('/v1/cycles')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        startDate: '2026-03-12',
        isPredicted: false,
      })
      .expect(201);

    const cycleId = (createCycleResponse.body as { id: string }).id;
    expect(cycleId).toBeTruthy();

    await request(app.getHttpServer())
      .patch(`/v1/cycles/${cycleId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        endDate: '2026-03-16',
      })
      .expect(200);

    await request(app.getHttpServer())
      .post('/v1/logs/batch')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        logs: [
          {
            date: '2026-03-16',
            flowLevel: 'LIGHT',
            mood: 'calm',
            symptoms: ['cramps'],
            temperature: 36.6,
            weight: 60.5,
            notes: 'Feeling okay',
          },
        ],
      })
      .expect(201)
      .expect({ accepted: 1, rejected: 0 });

    await request(app.getHttpServer())
      .get('/v1/cycles')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
      .expect((response) => {
        expect(response.body).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              id: cycleId,
              user_id: user.id,
            }),
          ]),
        );
      });

    await request(app.getHttpServer())
      .get('/v1/cycles/summary')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
      .expect((response) => {
        const summary = response.body as {
          averageCycle: number;
          averagePeriod: number;
        };

        expect(response.body).toEqual(
          expect.objectContaining({
            averageCycle: expect.any(Number) as number,
            averagePeriod: expect.any(Number) as number,
          }),
        );
        expect(summary.averageCycle).toBeGreaterThan(0);
        expect(summary.averagePeriod).toBeGreaterThan(0);
      });

    await prisma.dailyLog.deleteMany({ where: { user_id: user.id } });
    await prisma.cycle.deleteMany({ where: { user_id: user.id } });
    await prisma.user.delete({ where: { id: user.id } });
  });

  it('returns seeded content and premium-gates protected access', async () => {
    const installId = randomUUID();

    const authResponse = await request(app.getHttpServer())
      .post('/v1/auth/anonymous')
      .send({
        deviceId: installId,
        platform: 'android',
      })
      .expect(201);

    const { accessToken, user } = authResponse.body as {
      accessToken: string;
      user: { id: string };
    };

    const contentResponse = await request(app.getHttpServer())
      .get('/v1/content')
      .expect(200);

    expect(contentResponse.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'a6c09c90-76ec-47f8-bb8f-cdc9a55e0001',
          title: 'Understanding your cycle',
          is_premium: false,
        }),
        expect.objectContaining({
          id: 'a6c09c90-76ec-47f8-bb8f-cdc9a55e0002',
          is_premium: true,
        }),
      ]),
    );

    await request(app.getHttpServer())
      .get('/v1/content/a6c09c90-76ec-47f8-bb8f-cdc9a55e0001/access')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
      .expect((response) => {
        const access = response.body as {
          allowed: boolean;
          expiresIn: number;
          mediaUrl: string;
        };

        expect(response.body).toEqual(
          expect.objectContaining({
            allowed: true,
            expiresIn: 900,
          }),
        );
        expect(access.mediaUrl).toContain(
          '3847256c29ff8cdd63193eb0a969ebdb.r2.cloudflarestorage.com',
        );
        expect(access.mediaUrl).toContain('vye-storage');
        expect(access.mediaUrl).toContain('articles/cycle-basics.html');
      });

    await request(app.getHttpServer())
      .get('/v1/content/a6c09c90-76ec-47f8-bb8f-cdc9a55e0002/access')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
      .expect({
        allowed: false,
        expiresIn: null,
        mediaUrl: null,
      });

    await request(app.getHttpServer())
      .patch('/v1/users/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        averageCycle: 30,
        averagePeriod: 6,
      })
      .expect(200)
      .expect((response) => {
        expect(response.body).toEqual(
          expect.objectContaining({
            averageCycle: 30,
            averagePeriod: 6,
          }),
        );
      });

    await request(app.getHttpServer())
      .put('/v1/users/me/reminders')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        type: 'DAILY_LOG',
        timeUtc: '2026-03-19T09:00:00.000Z',
        isActive: true,
      })
      .expect(200)
      .expect((response) => {
        expect(response.body).toEqual(
          expect.objectContaining({
            type: 'DAILY_LOG',
            is_active: true,
          }),
        );
      });

    await request(app.getHttpServer())
      .get('/v1/users/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
      .expect((response) => {
        const profile = response.body as {
          id: string;
          averageCycle: number;
          averagePeriod: number;
          reminders: Array<{ type: string; isActive: boolean }>;
        };

        expect(profile.id).toBe(user.id);
        expect(profile.averageCycle).toBe(30);
        expect(profile.averagePeriod).toBe(6);
        expect(profile.reminders).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              type: 'DAILY_LOG',
              isActive: true,
            }),
          ]),
        );
      });

    await prisma.reminder.deleteMany({ where: { user_id: user.id } });

    await prisma.user.delete({ where: { id: user.id } });
  });
});
