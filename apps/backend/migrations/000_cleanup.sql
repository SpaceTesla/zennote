-- ============================================================================
-- ZENNOTE DATABASE CLEANUP SCRIPT
-- ============================================================================
-- Created: 2026-01-04
-- Purpose: Drop all tables and triggers from V1 professional schema
-- 
-- ⚠️  WARNING: THIS WILL DELETE ALL DATA
-- 
-- Only run this if you:
-- 1. Have backed up your data
-- 2. Are ready to apply a new schema
-- 3. Understand this is IRREVERSIBLE
-- 
-- Usage:
--   Local:  wrangler d1 execute zennote-d1 --local --file=./migrations/000_cleanup.sql
--   Remote: wrangler d1 execute zennote-d1 --remote --file=./migrations/000_cleanup.sql
-- ============================================================================

-- ============================================================================
-- DROP TRIGGERS FIRST (to avoid conflicts)
-- ============================================================================

-- Automatic timestamp triggers
DROP TRIGGER IF EXISTS trigger_users_updated_at;
DROP TRIGGER IF EXISTS trigger_user_profiles_updated_at;
DROP TRIGGER IF EXISTS trigger_user_settings_updated_at;
DROP TRIGGER IF EXISTS trigger_notes_updated_at;

-- Data integrity triggers
DROP TRIGGER IF EXISTS trigger_create_user_settings;
DROP TRIGGER IF EXISTS trigger_sync_view_count;
DROP TRIGGER IF EXISTS trigger_clear_slug_on_owner_delete;
DROP TRIGGER IF EXISTS trigger_update_ownership_on_owner_delete;

-- ============================================================================
-- DROP TABLES (in reverse dependency order)
-- ============================================================================

-- Drop child tables first (those with foreign keys)
DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS note_deletions;
DROP TABLE IF EXISTS note_views;
DROP TABLE IF EXISTS note_access;

-- Drop notes table
DROP TABLE IF EXISTS notes;

-- Drop user-related tables
DROP TABLE IF EXISTS user_settings;
DROP TABLE IF EXISTS user_profiles;

-- Drop users table last (parent table)
DROP TABLE IF EXISTS users;

-- ============================================================================
-- VERIFICATION
-- ============================================================================
-- 
-- After running this script, verify all tables are gone:
--   wrangler d1 execute zennote-d1 --remote --command "SELECT name FROM sqlite_master WHERE type='table';"
-- 
-- You should see an empty result or only sqlite internal tables.
-- 
-- Next step:
--   Apply the schema: 
--   wrangler d1 execute zennote-d1 --remote --file=./migrations/001_init_production.sql
-- ============================================================================

