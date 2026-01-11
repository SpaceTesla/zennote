# Backend Scripts

This directory contains utility scripts for backend operations.

## Scripts

- **`delete-account.ts`** - Delete user accounts and all associated data
- **`generate-og-images.ts`** - Generate OG images for notes
- **`generate-default-og.ts`** - Generate default OG image

---

# Account Deletion Script

## Overview

The `delete-account.ts` script completely removes a user account and all associated data from both Clerk (authentication) and the D1 database.

## What Gets Deleted

When you delete an account, the following data is removed:

1. **Clerk Account** - User authentication record
2. **Database Records:**
   - User record (`users` table)
   - User profile (`user_profiles` table)
   - User settings (`user_settings` table)
   - All notes owned by the user (`notes` table)
   - All note access records (`note_access` table)
   - All note views by the user (`note_views` table)
   - All note deletion records (`note_deletions` table)
   - All audit logs (`audit_logs` table)

## Prerequisites

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set environment variable:**
   ```bash
   export CLERK_SECRET_KEY="your-clerk-secret-key"
   ```
   
   Or create a `.env` file:
   ```
   CLERK_SECRET_KEY=your-clerk-secret-key
   ```

3. **Ensure you're logged into Wrangler:**
   ```bash
   wrangler login
   ```

## Usage

### Basic Usage (Remote Database)

```bash
npm run delete-account <email>
```

Example:
```bash
npm run delete-account user@example.com
```

### Local Database

To delete from the local development database:

```bash
npm run delete-account user@example.com --local
```

### Remote Database (Explicit)

To explicitly use the remote production database:

```bash
npm run delete-account user@example.com --remote
```

## How It Works

1. **Search**: Finds the user by email in the database
2. **Statistics**: Shows what will be deleted (notes count, profiles, etc.)
3. **Confirmation**: Requires typing "DELETE" to confirm
4. **Deletion**:
   - First deletes from Clerk
   - Then deletes all related data from the database
   - Handles cascading deletes automatically

## Safety Features

- ✅ Requires explicit confirmation (type "DELETE")
- ✅ Shows deletion summary before proceeding
- ✅ Handles errors gracefully
- ✅ Verifies user exists before deletion
- ✅ Handles cases where user might already be deleted from Clerk

## Example Output

```
🔍 Searching for user with email: user@example.com
📦 Database mode: remote

✅ User found:
   ID: abc123...
   Clerk User ID: user_xyz789
   Email: user@example.com

📊 Gathering deletion statistics...

⚠️  WARNING: This will permanently delete the account and all associated data!

📋 Deletion Summary:
   Email: user@example.com
   User ID: abc123...
   Clerk User ID: user_xyz789
   Notes: 15
   Profile: 1
   Settings: 1
   Access Records: 3
   Views: 42
   Deletions: 2
   Audit Logs: 127

❓ Are you sure you want to proceed? Type "DELETE" to confirm: DELETE

🗑️  Starting deletion process...

   Deleting user from Clerk (ID: user_xyz789)...
   ✅ User deleted from Clerk
   Deleting user from database...
   ✅ User deleted from database

✅ Account deletion completed successfully!
   All user data has been removed from both Clerk and the database.
```

## Troubleshooting

### "CLERK_SECRET_KEY environment variable is required"
- Make sure you've set the `CLERK_SECRET_KEY` environment variable
- You can find it in your Clerk dashboard under API Keys

### "User not found in database"
- Verify the email address is correct
- Check if you're using the correct database (local vs remote)

### "Failed to delete user from Clerk"
- Verify your Clerk secret key is correct
- Check if the user exists in Clerk
- Ensure you have proper permissions

### "SQL execution failed"
- Make sure you're logged into Wrangler: `wrangler login`
- Verify the database exists: `npm run db:check`
- Check if you're using the correct database mode (--local vs --remote)

## Important Notes

⚠️ **This action is irreversible!** Once deleted, the account and all data cannot be recovered.

⚠️ **Use with caution** - This script permanently removes all user data.

⚠️ **Test first** - Consider testing with a local database first before using on production.

---

# OG Image Generation Scripts

## Overview

These scripts generate Open Graph (OG) images for social media sharing and upload them to Cloudflare R2.

## Prerequisites

1. **R2 credentials** in `.env.local`:
   ```env
   R2_ACCOUNT_ID=your-account-id
   R2_ACCESS_KEY_ID=your-access-key
   R2_SECRET_ACCESS_KEY=your-secret-key
   R2_BUCKET_NAME=zennote-bucket
   ```

2. **R2 bucket** must exist with public access enabled (see `R2_CDN_SETUP.md`)

## Usage

### Generate Default OG Image

```bash
npm run og:default
```

Uploads `og/default.png` to R2. This is the fallback image used when a note doesn't have a custom OG image.

### Generate OG Image for a Note

```bash
npm run og:generate -- --noteId=<note-id>
```

Generates and uploads an OG image for a specific note to `og/notes/{noteId}.png`.

### Generate OG Images for All Public Notes

```bash
npm run og:generate -- --all
```

Fetches all public notes from the API and generates OG images for each.

## How It Works

1. Fetches note metadata from the API
2. Generates a 1200x630 PNG image with note title and excerpt
3. Uploads to R2 with `Cache-Control: public, max-age=31536000, immutable`
4. Images are served via R2's public URL

See `R2_CDN_SETUP.md` for complete R2 setup instructions.




