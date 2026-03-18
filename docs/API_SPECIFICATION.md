# Vye MVP API Specification

## Base Configuration

```yaml
openapi: 3.0.3
info:
  title: Vye API
  version: 1.0.0-mvp
  description: Privacy-first backend API for the Vye MVP mobile app

servers:
  - url: https://api.vye.app/v1
    description: Production
  - url: https://staging-api.vye.app/v1
    description: Staging
  - url: http://localhost:3000/v1
    description: Development
```

### Authentication Headers

```http
Authorization: Bearer <access_token>
Content-Type: application/json
X-Device-ID: <install_uuid>
X-App-Version: <app_version>
X-Platform: ios | android
```

## MVP Modules

- Auth
- Tracking
- Content
- Billing
- User Settings

## Auth APIs

### POST /auth/anonymous

Bootstrap an anonymous user session tied to the current app installation.

Request:

```json
{
  "deviceId": "uuid",
  "platform": "android",
  "appVersion": "0.1.0"
}
```

Response:

```json
{
  "user": {
    "id": "uuid",
    "isPremium": false,
    "averageCycle": 28,
    "averagePeriod": 5
  },
  "accessToken": "jwt"
}
```

### POST /auth/attach-account

Attach email and password to an existing anonymous user.

Request:

```json
{
  "email": "user@example.com",
  "password": "strong-password"
}
```

Response:

```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  },
  "accessToken": "jwt"
}
```

## Tracking APIs

### POST /cycles

Create a cycle start record.

Request:

```json
{
  "startDate": "2026-03-12",
  "isPredicted": false
}
```

### PATCH /cycles/:id

Update an existing cycle, typically to end the current period.

Request:

```json
{
  "endDate": "2026-03-16"
}
```

### GET /cycles

Fetch cycle history for the authenticated user.

### GET /cycles/summary

Return summary stats used by dashboard and insights.

Response:

```json
{
  "averageCycle": 28,
  "averagePeriod": 5,
  "nextPredictedPeriodStart": "2026-04-09",
  "fertileWindowStart": "2026-03-24",
  "fertileWindowEnd": "2026-03-29"
}
```

### POST /logs/batch

Accept multiple offline-created daily logs in one sync request.

Request:

```json
{
  "logs": [
    {
      "date": "2026-03-16",
      "flowLevel": "LIGHT",
      "mood": "happy",
      "symptoms": ["cramps", "bloating"],
      "temperature": 36.7,
      "weight": 61.5,
      "notes": "Mild cramps"
    }
  ]
}
```

Response:

```json
{
  "accepted": 1,
  "rejected": 0
}
```

## Content APIs

### GET /content

Return published content cards for the learn tab.

Response:

```json
[
  {
    "id": "uuid",
    "title": "Understanding your cycle",
    "type": "ARTICLE",
    "isPremium": false,
    "thumbnailUrl": "https://cdn.vye.app/thumbs/cycle-basics.jpg"
  }
]
```

### GET /content/:id/access

Return access state and a pre-signed media URL for premium users.

Response:

```json
{
  "allowed": true,
  "expiresIn": 900,
  "mediaUrl": "https://signed.cdn.vye.app/content/video.mp4"
}
```

## Billing API

### POST /webhooks/revenuecat

Receive RevenueCat events and update premium access.

Expected behavior:

- verify webhook authenticity
- map event to user via `revenuecat_app_user_id` or `user.id`
- set `is_premium = true` when entitlement becomes active
- set `premium_expiry` when expiry is known

## Settings APIs

### GET /users/me

Return MVP profile and settings values needed by the app.

### PATCH /users/me

Update average cycle, average period, or attached email metadata.

### GET /users/me/export

Reserved for premium health report export workflow.

## Non-MVP APIs

The following are intentionally excluded from the first release:

- community feeds
- comments, likes, followers
- store, cart, orders, transactions
- public profile
- server-triggered push notification automation

If these features return later, they should be documented in a new post-MVP spec rather than added back into this file ad hoc.
