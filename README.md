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

- NestJS app scaffolded
- MVP docs rewritten around launch scope
- Prisma schema aligned to MVP models
- feature modules still need to be implemented

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
```

Prisma commands will be added once the database layer is wired.
