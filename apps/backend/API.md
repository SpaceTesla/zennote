# Zennote Backend API Documentation

## Base URL

All API endpoints are prefixed with `/v1` (e.g., `/v1/notes`).

## Authentication

Most endpoints support optional authentication. When authenticated, users can:
- Create permanent notes (vs temporary 7-day notes)
- Access private notes
- Share notes with other users

### Getting a Token

```bash
POST /v1/auth/register
POST /v1/auth/login
```

Both return:
```json
{
  "success": true,
  "data": {
    "token": "jwt-token-here",
    "user": {
      "id": "user-id",
      "email": "user@example.com"
    }
  }
}
```

### Using the Token

Include the token in the `Authorization` header:
```
Authorization: Bearer <token>
```

## Standard Response Format

All responses follow this structure:

**Success:**
```json
{
  "success": true,
  "data": { /* response data */ },
  "meta": {
    "requestId": "uuid",
    "timestamp": "2024-01-01T00:00:00Z",
    "pagination": { /* if applicable */ }
  }
}
```

**Error:**
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "details": { /* optional */ }
  },
  "meta": {
    "requestId": "uuid",
    "timestamp": "2024-01-01T00:00:00Z"
  }
}
```

## Endpoints

### Health Check

**GET** `/health` or `/v1/health`

Returns API health status.

### Authentication

#### Register
**POST** `/v1/auth/register`

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Login
**POST** `/v1/auth/login`

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Get Current User
**GET** `/v1/auth/me` (requires auth)

Returns current user with profile.

### Notes

#### List Notes
**GET** `/v1/notes`

Query parameters:
- `page` (default: 1)
- `limit` (default: 20)
- `search` (optional)
- `sortBy` (created_at, updated_at, title)
- `sortOrder` (ASC, DESC)

#### Get Note
**GET** `/v1/notes/:id`

Returns note if user has access (public, owner, or shared).

#### Create Note
**POST** `/v1/notes`

```json
{
  "title": "Note Title",
  "content": "Note content",
  "is_public": false
}
```

- Unauthenticated: Creates temporary note (expires in 7 days)
- Authenticated: Creates permanent note

#### Update Note
**PUT** `/v1/notes/:id` (requires auth)

```json
{
  "title": "Updated Title",
  "content": "Updated content",
  "is_public": true
}
```

Requires owner, write, or admin permission.

#### Delete Note
**DELETE** `/v1/notes/:id` (requires auth)

Requires owner or admin permission.

#### Share Note
**POST** `/v1/notes/:id/share` (requires auth)

```json
{
  "user_id": "target-user-id",
  "permission_level": "read" | "write" | "admin"
}
```

Requires owner or admin permission.

#### Revoke Access
**DELETE** `/v1/notes/:id/access/:userId` (requires auth)

Requires owner or admin permission.

#### Get Collaborators
**GET** `/v1/notes/:id/collaborators` (requires auth)

Returns list of users with access to the note.

### Profiles

#### Get Profile
**GET** `/v1/profiles/:userId`

Returns public profile information.

#### Update Profile
**PUT** `/v1/profiles/me` (requires auth)

```json
{
  "display_name": "Display Name",
  "bio": "Bio text",
  "avatar_url": "https://...",
  "website": "https://...",
  "location": "Location"
}
```

#### Update Social Links
**PUT** `/v1/profiles/me/socials` (requires auth)

```json
{
  "links": [
    {
      "platform": "twitter",
      "url": "https://twitter.com/username"
    },
    {
      "platform": "github",
      "url": "https://github.com/username"
    }
  ]
}
```

### Admin

#### Manual Cleanup
**POST** `/v1/admin/cleanup` (requires auth)

Manually trigger cleanup of expired temporary notes.

## Note Access Control

### Permission Levels

- **owner**: Full control (read, write, share, delete)
- **admin**: Can read, write, share, and delete
- **write**: Can read and edit content
- **read**: Can only view content

### Note Types

- **Temporary Notes**: Created by unauthenticated users, expire after 7 days
- **Permanent Notes**: Created by authenticated users, never expire

### Access Rules

- Public notes: Accessible to everyone
- Private notes: Only owner and users with explicit access
- Expired notes: Automatically filtered out

## Rate Limiting

Rate limits are applied per IP address:
- Login: 5 requests per minute
- Register: 3 requests per hour
- Default: 100 requests per minute

Rate limit headers are included in responses:
- `X-RateLimit-Limit`
- `X-RateLimit-Remaining`
- `X-RateLimit-Reset`

## Caching

- Public notes: Cached for 1 hour
- Private notes: Cached for 5 minutes
- User data: Cached for 15 minutes
- Access checks: Cached for 5 minutes

ETags are supported for conditional requests using `If-None-Match` header.

