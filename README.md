# Vye Backend

NestJS backend for the Vye MVP.

## MVP Scope

This backend supports the first Play Store release only.

Included:

- anonymous auth tied to the current app installation
- optional email and password attachment later
- cycle create and update
- batch daily log sync
- premium content delivery
- RevenueCat webhook handling
- user settings needed for cycle tracking and premium access

Excluded from MVP:

- community
- e-commerce and store
- followers, likes, comments, posts
- public profile
- server-driven reminder webhooks and cron-based push workflows

## Planned Stack

- NestJS
- Prisma
- PostgreSQL
- JWT auth
- RevenueCat webhook integration
- S3 or R2 for protected media delivery

## Key Product Rules

- mobile is offline-first and writes locally first
- backend is stateless and identifies users from JWT payloads
- anonymous users are tied to one app installation until they create an account

## Current Status

- Neon-backed Prisma migrations applied
- JWT auth and install-scoped anonymous flow implemented
- users, tracking, content, and billing modules implemented for MVP
- Swagger docs available for interactive API review

## Planned Modules

- `auth`
- `users`
- `tracking`
- `content`
- `billing`

## Important Commands

```bash
npm install
npm run start:dev
npm run build
npm run test
npm run test:e2e
npm run prisma:seed
```

## API Docs

- Swagger UI: `http://localhost:3000/docs`
- API base path: `http://localhost:3000/v1`

Manual curl-based testing examples live in `pt-backend/docs/manual-testing.md`.
