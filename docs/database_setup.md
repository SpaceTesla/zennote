# Database Setup Guide

## Problem
If you're seeing errors like:
- `binding DB of type d1 must have a database that already exists`
- `500 Internal Server Error` when calling API endpoints
- `no such table` errors

This means the D1 database hasn't been created or migrations haven't been run.

## Solution

### Step 1: Create the D1 Database

Run this command to create the database in Cloudflare:

```bash
npm run db:create
```

This will output a database ID. **Copy this ID** - you'll need it in the next step.

### Step 2: Update wrangler.toml

Update the `database_id` in `wrangler.toml` with the ID from Step 1:

```toml
[[d1_databases]]
binding = "DB"
database_name = "zennote-d1"
database_id = "YOUR_DATABASE_ID_HERE"  # Replace with the ID from Step 1
```

### Step 3: Run Migrations

Run the migrations to set up the database schema:

```bash
npm run db:migrate
```

This will create all tables, indexes, and triggers for the complete schema.

### Step 4: Deploy

Now you can deploy:

```bash
npm run deploy
```

## Local Development

For local development, use:

```bash
npm run db:migrate:local
```

This runs migrations against your local D1 database.

## Manual Commands

If you prefer to run commands manually:

```bash
# Create database
wrangler d1 create zennote-d1

# Run migration (production)
wrangler d1 execute zennote-d1 --remote --file=./migrations/001_init_production.sql

# Run migration (local)
wrangler d1 execute zennote-d1 --local --file=./migrations/001_init_production.sql
```

## Verify Setup

Check the health endpoint to verify the database is working:

```bash
curl https://zennote-worker.shivansh-karan.workers.dev/v1/health
```

You should see:
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "database": "connected",
    "timestamp": "..."
  }
}
```

## Troubleshooting

### Database ID Mismatch
If deployment fails with "database must already exist", make sure:
1. The database was created in the same Cloudflare account
2. The `database_id` in `wrangler.toml` matches the created database ID
3. You're logged into the correct Cloudflare account (`wrangler whoami`)

### Migration Errors
If migrations fail:
- Check that the database exists: `wrangler d1 list`
- Verify the database_id in wrangler.toml matches: `wrangler d1 info zennote-d1`
- Try running migrations one at a time to identify which one fails

### Still Getting 500 Errors
- Check Cloudflare Workers logs: `wrangler tail`
- Verify JWT_SECRET is set: `wrangler secret list`
- Ensure all migrations ran successfully

