# Vye MVP Manual API Testing

Set a token after bootstrapping an anonymous user.

## 1. Health

```bash
curl http://localhost:3000/v1/health
```

## 2. Anonymous Auth

```bash
curl -X POST http://localhost:3000/v1/auth/anonymous \
  -H 'Content-Type: application/json' \
  -d '{
    "deviceId": "11111111-1111-1111-1111-111111111111",
    "platform": "android",
    "appVersion": "0.1.0"
  }'
```

Copy `accessToken` from the response and export it:

```bash
export VYE_TOKEN='paste-token-here'
```

## 3. Profile

```bash
curl http://localhost:3000/v1/users/me \
  -H "Authorization: Bearer $VYE_TOKEN"
```

```bash
curl -X PATCH http://localhost:3000/v1/users/me \
  -H "Authorization: Bearer $VYE_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{
    "averageCycle": 29,
    "averagePeriod": 5
  }'
```

## 4. Reminder Preferences

```bash
curl -X PUT http://localhost:3000/v1/users/me/reminders \
  -H "Authorization: Bearer $VYE_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{
    "type": "DAILY_LOG",
    "timeUtc": "2026-03-19T09:00:00.000Z",
    "isActive": true
  }'
```

```bash
curl http://localhost:3000/v1/users/me/reminders \
  -H "Authorization: Bearer $VYE_TOKEN"
```

## 5. Cycles and Logs

```bash
curl -X POST http://localhost:3000/v1/cycles \
  -H "Authorization: Bearer $VYE_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{
    "startDate": "2026-03-12",
    "isPredicted": false
  }'
```

```bash
curl -X POST http://localhost:3000/v1/logs/batch \
  -H "Authorization: Bearer $VYE_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{
    "logs": [
      {
        "date": "2026-03-16",
        "flowLevel": "LIGHT",
        "mood": "calm",
        "symptoms": ["cramps"],
        "temperature": 36.6,
        "weight": 60.5,
        "notes": "Feeling okay"
      }
    ]
  }'
```

## 6. Seeded Content

```bash
curl http://localhost:3000/v1/content
```

```bash
curl http://localhost:3000/v1/content/a6c09c90-76ec-47f8-bb8f-cdc9a55e0001/access \
  -H "Authorization: Bearer $VYE_TOKEN"
```

## 7. RevenueCat Webhook Test

```bash
curl -X POST http://localhost:3000/v1/webhooks/revenuecat \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer test_htHFzeNliVsqNnGiWHCcHSEiFjZ' \
  -d '{
    "event": {
      "app_user_id": "11111111-1111-1111-1111-111111111111",
      "expiration_at_ms": 1770000000000
    }
  }'
```
