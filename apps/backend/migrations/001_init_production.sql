-- ============================================================================
-- ZENNOTE DATABASE CLEANUP SCRIPT
-- ============================================================================
-- Created: 2026-01-04
-- Purpose: Drop all tables from old schema before applying new migration
-- 
-- ⚠️  WARNING: THIS WILL DELETE ALL DATA
-- 
-- Only run this if you:
-- 1. Have backed up your data
-- 2. Are ready to apply the new V1 professional schema
-- 3. Understand this is IRREVERSIBLE
-- 
-- Usage:
--   Local:  wrangler d1 execute zennote-d1 --local --file=./migrations/001_init_production.sql
--   Remote: wrangler d1 execute zennote-d1 --remote --file=./migrations/001_init_production.sql
-- ============================================================================

-- ============================================================================
-- DROP TRIGGERS FIRST (to avoid conflicts)
-- ============================================================================

DROP TRIGGER IF EXISTS trigger_notes_updated_at;
DROP TRIGGER IF EXISTS trigger_user_profiles_updated_at;
DROP TRIGGER IF EXISTS trigger_users_updated_at;

-- ============================================================================
-- DROP TABLES (in reverse dependency order)
-- ============================================================================

-- Drop child tables first (those with foreign keys)
DROP TABLE IF EXISTS note_access;
DROP TABLE IF EXISTS user_notes;
DROP TABLE IF EXISTS user_socials;

-- Drop notes table
DROP TABLE IF EXISTS notes;

-- Drop user-related tables
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
--   Apply the new schema: 
--   wrangler d1 execute zennote-d1 --remote --file=./migrations/002_v1_professional.sql
-- ============================================================================

