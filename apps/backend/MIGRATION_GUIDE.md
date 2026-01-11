# Database Schema

The production schema is defined in `migrations/001_init_production.sql`.

## Schema Overview

### Key Features

- **Clerk Authentication**: Uses `clerk_user_id` (no password hashes)
- **Direct Ownership**: `notes.owner_id` for fast owner lookups
- **Collaboration**: `last_edited_by` tracks who last modified shared notes
- **Analytics**: `view_count` for popularity tracking
- **Auto Timestamps**: SQLite triggers update `updated_at` automatically
- **Optimized Indexes**: Composite and partial indexes for common queries

### Tables

- `users` - User accounts (linked to Clerk)
- `user_profiles` - Public user profiles
- `user_socials` - Social media links
- `notes` - Note content and metadata
- `user_notes` - User-note relationships
- `note_access` - Sharing permissions

## Migration

```bash
# Run production migration
npm run db:migrate

# Run local migration
npm run db:migrate:local
```

## TypeScript Types

The schema matches these TypeScript interfaces:
- `User` - `clerk_user_id` required (no `password_hash`)
- `Note` - Includes `owner_id`, `view_count`, `last_edited_by`

See `src/types/` for full type definitions.










