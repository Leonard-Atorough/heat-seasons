# API Design v1.0

## Overview

RESTful API for Heat Seasons leaderboard application. Designed for web and mobile web delivery to small user group (game session participants).

**Target Users:** 5-10 participants
**Deployment:** Web-based, room to scale
**Authentication:** JWT-based with role management

---

## Authentication & Authorization

### Roles

- **Admin**: Full access - manage seasons, races, racers, and users
- **User**: Read access to leaderboards, limited write access to own profile

### Endpoints

#### POST `/api/auth/register`

Register a new user account.

```json
Request:
{
  "email": "player@example.com",
  "password": "securepassword",
  "name": "John Doe"
}

Response: 201 Created
{
  "id": "uuid",
  "email": "player@example.com",
  "name": "John Doe",
  "role": "user",
  "token": "jwt-token"
}
```

#### POST `/api/auth/login`

Authenticate user and receive JWT token.

```json
Request:
{
  "email": "player@example.com",
  "password": "securepassword"
}

Response: 200 OK
{
  "id": "uuid",
  "email": "player@example.com",
  "name": "John Doe",
  "role": "user",
  "token": "jwt-token",
  "expiresIn": 86400
}
```

#### POST `/api/auth/refresh`

Refresh expired JWT token.

```json
Request:
{
  "refreshToken": "refresh-token"
}

Response: 200 OK
{
  "token": "new-jwt-token",
  "expiresIn": 86400
}
```

#### POST `/api/auth/logout`

Invalidate user session (if using token blacklist).

```json
Request: Headers: Authorization: Bearer {token}

Response: 204 No Content
```

---

## Racer Management

### Endpoints

#### GET `/api/racers`

Get all racers.

```json
Query Parameters:
- active: boolean (filter by active status)
- sort: string (name, joinDate)

Response: 200 OK
{
  "racers": [
    {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "active": true,
      "joinDate": "2025-01-15T00:00:00Z",
      "stats": {
        "totalRaces": 12,
        "wins": 3,
        "avgPosition": 4.2
      }
    }
  ],
  "total": 8
}
```

#### GET `/api/racers/:id`

Get racer details and history.

```json
Response: 200 OK
{
  "id": "uuid",
  "name": "John Doe",
  "email": "john@example.com",
  "active": true,
  "joinDate": "2025-01-15T00:00:00Z",
  "stats": {
    "totalRaces": 12,
    "wins": 3,
    "podiums": 7,
    "avgPosition": 4.2,
    "totalPoints": 156
  },
  "recentRaces": [
    {
      "raceId": "uuid",
      "seasonName": "Winter 2025",
      "date": "2025-12-10T00:00:00Z",
      "position": 2,
      "points": 18
    }
  ]
}
```

#### POST `/api/racers`

Create new racer (Admin only).

```json
Request:
{
  "name": "Jane Smith",
  "email": "jane@example.com"
}

Response: 201 Created
{
  "id": "uuid",
  "name": "Jane Smith",
  "email": "jane@example.com",
  "active": true,
  "joinDate": "2025-12-14T00:00:00Z"
}
```

#### PUT `/api/racers/:id`

Update racer information (Admin only).

```json
Request:
{
  "name": "Jane Smith-Jones",
  "active": true
}

Response: 200 OK
{
  "id": "uuid",
  "name": "Jane Smith-Jones",
  "email": "jane@example.com",
  "active": true,
  "joinDate": "2025-01-15T00:00:00Z"
}
```

#### DELETE `/api/racers/:id`

Soft delete racer (Admin only) - sets active to false.

```json
Response: 204 No Content
```

---

## Season Management

### Endpoints

#### GET `/api/seasons`

Get all seasons.

```json
Query Parameters:
- status: string (active, completed, archived)
- limit: integer
- offset: integer

Response: 200 OK
{
  "seasons": [
    {
      "id": "uuid",
      "name": "Winter 2025",
      "startDate": "2025-11-01T00:00:00Z",
      "endDate": null,
      "status": "active",
      "raceCount": 5,
      "participantCount": 8
    }
  ],
  "total": 3,
  "limit": 10,
  "offset": 0
}
```

#### GET `/api/seasons/:id`

Get season details with leaderboard.

```json
Response: 200 OK
{
  "id": "uuid",
  "name": "Winter 2025",
  "startDate": "2025-11-01T00:00:00Z",
  "endDate": null,
  "status": "active",
  "races": [
    {
      "id": "uuid",
      "raceNumber": 1,
      "date": "2025-11-05T00:00:00Z",
      "participantCount": 7
    }
  ],
  "leaderboard": [
    {
      "position": 1,
      "racerId": "uuid",
      "racerName": "John Doe",
      "totalPoints": 95,
      "racesParticipated": 5,
      "wins": 2,
      "avgPosition": 2.4
    }
  ]
}
```

#### POST `/api/seasons`

Create new season (Admin only).

```json
Request:
{
  "name": "Spring 2026",
  "startDate": "2026-03-01T00:00:00Z"
}

Response: 201 Created
{
  "id": "uuid",
  "name": "Spring 2026",
  "startDate": "2026-03-01T00:00:00Z",
  "endDate": null,
  "status": "active",
  "raceCount": 0
}
```

#### PUT `/api/seasons/:id`

Update season (Admin only).

```json
Request:
{
  "name": "Spring 2026 Championship",
  "endDate": "2026-06-30T00:00:00Z",
  "status": "completed"
}

Response: 200 OK
{
  "id": "uuid",
  "name": "Spring 2026 Championship",
  "startDate": "2026-03-01T00:00:00Z",
  "endDate": "2026-06-30T00:00:00Z",
  "status": "completed",
  "raceCount": 6
}
```

#### DELETE `/api/seasons/:id`

Delete season (Admin only). Only if no races recorded.

```json
Response: 204 No Content

Error: 409 Conflict
{
  "error": "Cannot delete season with recorded races"
}
```

---

## Race & Results Management

### Endpoints

#### GET `/api/seasons/:seasonId/races`

Get all races for a season.

```json
Response: 200 OK
{
  "races": [
    {
      "id": "uuid",
      "seasonId": "uuid",
      "raceNumber": 1,
      "date": "2025-11-05T00:00:00Z",
      "participantCount": 7,
      "winner": "John Doe"
    }
  ],
  "total": 5
}
```

#### GET `/api/races/:id`

Get race details with full results.

```json
Response: 200 OK
{
  "id": "uuid",
  "seasonId": "uuid",
  "seasonName": "Winter 2025",
  "raceNumber": 1,
  "date": "2025-11-05T00:00:00Z",
  "results": [
    {
      "position": 1,
      "racerId": "uuid",
      "racerName": "John Doe",
      "points": 25
    },
    {
      "position": 2,
      "racerId": "uuid",
      "racerName": "Jane Smith",
      "points": 18
    }
  ]
}
```

#### POST `/api/seasons/:seasonId/races`

Create race and record results (Admin only).

```json
Request:
{
  "date": "2025-12-14T19:00:00Z",
  "results": [
    {
      "racerId": "uuid",
      "position": 1
    },
    {
      "racerId": "uuid",
      "position": 2
    }
  ]
}

Validation:
- 2-9 racers required
- Positions must be sequential (1, 2, 3...)
- No duplicate racers
- No duplicate positions

Response: 201 Created
{
  "id": "uuid",
  "seasonId": "uuid",
  "raceNumber": 6,
  "date": "2025-12-14T19:00:00Z",
  "results": [
    {
      "position": 1,
      "racerId": "uuid",
      "racerName": "John Doe",
      "points": 25
    }
  ]
}
```

#### PUT `/api/races/:id`

Update race results (Admin only).

```json
Request:
{
  "date": "2025-12-14T20:00:00Z",
  "results": [
    {
      "racerId": "uuid",
      "position": 1
    }
  ]
}

Response: 200 OK
{
  "id": "uuid",
  "seasonId": "uuid",
  "raceNumber": 6,
  "date": "2025-12-14T20:00:00Z",
  "results": [...]
}
```

#### DELETE `/api/races/:id`

Delete race and results (Admin only).

```json
Response: 204 No Content

Note: Recalculates season standings after deletion
```

---

## Leaderboard

### Endpoints

#### GET `/api/leaderboard/current`

Get current active season leaderboard.

```json
Response: 200 OK
{
  "seasonId": "uuid",
  "seasonName": "Winter 2025",
  "asOfDate": "2025-12-14T00:00:00Z",
  "standings": [
    {
      "position": 1,
      "racerId": "uuid",
      "racerName": "John Doe",
      "totalPoints": 95,
      "racesParticipated": 5,
      "wins": 2,
      "avgPosition": 2.4,
      "lastRacePosition": 1
    }
  ]
}
```

#### GET `/api/leaderboard/season/:seasonId`

Get leaderboard for specific season.

```json
Response: 200 OK
{
  "seasonId": "uuid",
  "seasonName": "Winter 2025",
  "standings": [...]
}
```

#### GET `/api/leaderboard/alltime`

Get all-time statistics across all seasons.

```json
Response: 200 OK
{
  "statistics": [
    {
      "racerId": "uuid",
      "racerName": "John Doe",
      "totalPoints": 450,
      "totalRaces": 24,
      "totalWins": 8,
      "totalPodiums": 16,
      "avgPosition": 3.2,
      "seasonsParticipated": 3
    }
  ]
}
```

---

## Points Configuration

### Endpoints

#### GET `/api/config/points`

Get current points configuration.

```json
Response: 200 OK
{
  "pointsSystem": {
    "1": 25,
    "2": 18,
    "3": 15,
    "4": 12,
    "5": 10,
    "6": 8,
    "7": 6,
    "8": 4,
    "9": 2
  },
  "lastModified": "2025-01-01T00:00:00Z"
}
```

#### PUT `/api/config/points`

Update points configuration (Admin only).

```json
Request:
{
  "pointsSystem": {
    "1": 25,
    "2": 20,
    "3": 16,
    "4": 13,
    "5": 11,
    "6": 9,
    "7": 7,
    "8": 5,
    "9": 3
  }
}

Response: 200 OK
{
  "pointsSystem": {...},
  "lastModified": "2025-12-14T00:00:00Z"
}

Note: Does not retroactively recalculate existing race points
```

---

## Error Responses

### Standard Error Format

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {},
  "timestamp": "2025-12-14T00:00:00Z"
}
```

### Common Status Codes

- `200 OK` - Successful GET/PUT request
- `201 Created` - Successful POST request
- `204 No Content` - Successful DELETE request
- `400 Bad Request` - Invalid input data
- `401 Unauthorized` - Missing or invalid authentication
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `409 Conflict` - Business logic violation
- `422 Unprocessable Entity` - Validation errors
- `500 Internal Server Error` - Server error

---

## Future Considerations

### Version 1.1+

- Webhooks for real-time updates
- Bulk race import/export
- Race photos/media uploads
- Push notifications
- GraphQL alternative endpoint
- Rate limiting implementation
- API versioning strategy
- Pagination metadata improvements
- Advanced filtering and search
