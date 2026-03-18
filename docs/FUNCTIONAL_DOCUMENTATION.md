# Vye MVP Functional Documentation

## Executive Summary

Vye is being shipped first as a premium, privacy-first period tracker.

The MVP excludes social and commerce features so the team can focus on:

- reliable cycle tracking
- offline-first daily logging
- anonymous-first onboarding
- premium insights and learning content
- clean backend foundations for later scale

## Product Modules

| Module | MVP Status | Purpose |
|--------|------------|---------|
| Dashboard | In scope | Calendar, current cycle, predictions |
| Daily Log | In scope | Flow, symptoms, mood, temperature, notes |
| Insights | In scope | Free summaries and premium-locked charts |
| Content / Learn | In scope | Articles and videos with premium gating |
| Settings | In scope | Preferences, privacy, reminders, backup entry |
| Community | Out of scope | Deferred until post-MVP |
| L-Store | Out of scope | Deferred until post-MVP |

## Anonymous-First Rule

For MVP, a user begins anonymously and is tied to the current app installation.

Implications:

- no forced sign-up on first launch
- no pre-account cross-device recovery
- account creation is an upgrade step from Settings
- backend tokens remain stateless JWTs

## Mobile Requirements

### App Shell

- bare React Native CLI app
- React Navigation
- WatermelonDB as the local source of truth
- secure token storage for JWTs

### Main Tabs

- Dashboard
- Insights
- Content
- Settings

### Core Flows

1. bootstrap anonymous user
2. complete onboarding
3. write tracking data locally first
4. sync changes in the background
5. gate premium insights and media through RevenueCat

## Backend Requirements

### Auth

- create anonymous user from install identity
- issue JWT for anonymous user
- allow attaching email and password later

### Tracking

- create cycle start
- update cycle end
- return dashboard summaries
- accept batched daily logs from offline sync

### Content

- return article and video metadata
- generate protected media URLs for premium users

### Billing

- process RevenueCat webhooks
- toggle premium access on the user record

### Settings

- store cycle averages
- store reminder preferences for local notification setup
- support future export workflow

## Database Overview

Core tables:

- `users`
- `cycles`
- `daily_logs`
- `reminders`
- `content`
- `user_content_access`

Important data rules:

- `daily_logs` must be unique per `user_id + date`
- no community or store tables in MVP
- timestamps on all core tables
- premium state is synced from RevenueCat into `users.is_premium`

## Local-First Sync Rule

The mobile app must never block the UI on a network response for tracking actions.

Expected behavior:

1. user logs flow or symptoms
2. app writes to WatermelonDB immediately
3. UI updates from local state
4. sync engine sends batched changes later
5. backend responds with accepted updates

## Security Requirements

- HTTPS only
- bcrypt or argon2 password hashing
- JWT-based authentication
- request validation on all write endpoints
- rate limiting on auth and webhook endpoints
- no plaintext secret exposure in logs

## Revenue Model

RevenueCat handles subscription state and store billing.

The backend only needs to:

- receive webhook events
- map events to a user
- toggle premium flags
- store expiry metadata if available

The backend does not need store, cart, order, or transaction tables for MVP.

## Explicitly Deferred

- community feed
- anonymous posting
- comments and reactions
- followers and following
- product marketplace
- carts and checkout
- heavy server-side reminder jobs

## Implementation Priority

### Phase 1

1. anonymous auth
2. Prisma schema and database
3. cycle endpoints
4. batch daily log sync

### Phase 2

5. content APIs
6. RevenueCat webhook
7. user settings endpoints

### Phase 3

8. premium insights data endpoints
9. export-ready health report groundwork

## Environment Variables

```bash
DATABASE_URL=postgresql://user:pass@host:5432/vye
JWT_SECRET=replace-me
JWT_EXPIRY=15m
AWS_REGION=us-east-1
S3_BUCKET=vye-content
S3_ACCESS_KEY_ID=replace-me
S3_SECRET_ACCESS_KEY=replace-me
REVENUECAT_WEBHOOK_SECRET=replace-me
```
