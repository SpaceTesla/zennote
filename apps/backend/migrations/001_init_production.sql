-- ============================================================================
-- ZENNOTE V1 PROFESSIONAL DATABASE SCHEMA
-- ============================================================================
-- Created: 2026-01-04
-- Database: Cloudflare D1 (SQLite)
-- Auth: Clerk
-- 
-- Features:
-- ✓ Private / Unlisted / Public / Anonymous notes
-- ✓ Collaboration & permissions
-- ✓ Expiration support
-- ✓ Clean public URLs with slugs
-- ✓ Soft deletes & recovery
-- ✓ Analytics-ready
-- ✓ Audit logging
-- ✓ Future-proof without rewrites
-- ============================================================================

-- ============================================================================
-- USERS & AUTHENTICATION
-- ============================================================================

-- Core users table (Clerk-backed identity)
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY NOT NULL,                -- internal UUID
    clerk_user_id TEXT UNIQUE NOT NULL,          -- Clerk user id
    email TEXT UNIQUE NOT NULL,

    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_users_clerk_id ON users(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ============================================================================
-- USER PROFILES (public-facing identity)
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_profiles (
    user_id TEXT PRIMARY KEY NOT NULL,

    username TEXT UNIQUE NOT NULL,              -- used in public URLs (lowercase, alphanumeric + hyphens, 3-30 chars)
    display_name TEXT,
    bio TEXT,
    avatar_url TEXT,
    website_url TEXT,
    location TEXT,

    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON user_profiles(username);

-- Note: Username validation (app-level):
-- - Lowercase alphanumeric + hyphens only
-- - 3-30 characters
-- - Cannot start/end with hyphen
-- - Reserved words blacklist: admin, api, auth, settings, etc.

-- ============================================================================
-- USER SETTINGS (preferences & defaults)
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_settings (
    user_id TEXT PRIMARY KEY NOT NULL,

    default_visibility TEXT NOT NULL
        CHECK (default_visibility IN ('private', 'unlisted', 'public'))
        DEFAULT 'unlisted',

    allow_search_index INTEGER NOT NULL DEFAULT 1,
    show_profile INTEGER NOT NULL DEFAULT 1,

    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================================
-- NOTES (all note types)
-- ============================================================================

CREATE TABLE IF NOT EXISTS notes (
    id TEXT PRIMARY KEY NOT NULL,

    title TEXT NOT NULL,
    content TEXT NOT NULL,

    -- Ownership (explicit type for clarity)
    ownership_type TEXT NOT NULL
        CHECK (ownership_type IN ('user', 'anonymous')),
    owner_id TEXT,                              -- NULL only if anonymous

    -- Visibility control
    visibility TEXT NOT NULL
        CHECK (visibility IN ('private', 'unlisted', 'public')),

    -- Public URL support
    slug TEXT,                                  -- e.g., "clean-redis-explanation"
    slug_owner_id TEXT,                         -- who owns the slug namespace

    -- Behavior flags
    is_editable INTEGER NOT NULL DEFAULT 1,
    expires_at TEXT,                            -- NULL = never expires

    -- Metadata
    view_count INTEGER NOT NULL DEFAULT 0,

    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),

    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (slug_owner_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Slug uniqueness per user (enables /username/slug URLs)
CREATE UNIQUE INDEX IF NOT EXISTS idx_notes_slug_per_user
ON notes(slug_owner_id, slug)
WHERE slug IS NOT NULL;

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_notes_slug
ON notes(slug)
WHERE slug IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_notes_owner_created
ON notes(owner_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notes_visibility
ON notes(visibility);

CREATE INDEX IF NOT EXISTS idx_notes_visibility_created
ON notes(visibility, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notes_expires_at
ON notes(expires_at)
WHERE expires_at IS NOT NULL;

-- ============================================================================
-- NOTE ACCESS (collaboration & permissions)
-- ============================================================================

CREATE TABLE IF NOT EXISTS note_access (
    note_id TEXT NOT NULL,
    user_id TEXT NOT NULL,

    permission_level TEXT NOT NULL
        CHECK (permission_level IN ('read', 'write', 'admin')),

    granted_by TEXT NOT NULL,

    created_at TEXT NOT NULL DEFAULT (datetime('now')),

    PRIMARY KEY (note_id, user_id),

    FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (granted_by) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_note_access_note_id ON note_access(note_id);
CREATE INDEX IF NOT EXISTS idx_note_access_user_id ON note_access(user_id);

-- ============================================================================
-- NOTE VIEWS (analytics & tracking)
-- ============================================================================

CREATE TABLE IF NOT EXISTS note_views (
    id TEXT PRIMARY KEY NOT NULL,
    note_id TEXT NOT NULL,

    viewer_user_id TEXT,                        -- NULL for anonymous views
    viewer_ip_hash TEXT,                        -- privacy-safe IP hash

    created_at TEXT NOT NULL DEFAULT (datetime('now')),

    FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE,
    FOREIGN KEY (viewer_user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_note_views_note_id ON note_views(note_id);
CREATE INDEX IF NOT EXISTS idx_note_views_created_at ON note_views(created_at);
CREATE INDEX IF NOT EXISTS idx_note_views_ip_hash ON note_views(viewer_ip_hash)
WHERE viewer_ip_hash IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_note_views_user_created ON note_views(viewer_user_id, created_at)
WHERE viewer_user_id IS NOT NULL;

-- ============================================================================
-- NOTE DELETIONS (soft delete & recovery)
-- ============================================================================

CREATE TABLE IF NOT EXISTS note_deletions (
    note_id TEXT PRIMARY KEY NOT NULL,
    deleted_by TEXT,
    reason TEXT,

    deleted_at TEXT NOT NULL DEFAULT (datetime('now')),

    FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE,
    FOREIGN KEY (deleted_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_note_deletions_deleted_at ON note_deletions(deleted_at);

-- ============================================================================
-- AUDIT LOGS (security & debugging)
-- ============================================================================

CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY NOT NULL,

    user_id TEXT,                               -- NULL for system actions
    action TEXT NOT NULL,                       -- e.g., "note.created", "note.shared"
    entity_type TEXT NOT NULL,                  -- e.g., "note", "user"
    entity_id TEXT,

    metadata TEXT,                              -- JSON string for extra context

    created_at TEXT NOT NULL DEFAULT (datetime('now')),

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- ============================================================================
-- AUTOMATIC TIMESTAMP TRIGGERS
-- ============================================================================

CREATE TRIGGER IF NOT EXISTS trigger_users_updated_at
AFTER UPDATE ON users
BEGIN
    UPDATE users SET updated_at = datetime('now') WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS trigger_user_profiles_updated_at
AFTER UPDATE ON user_profiles
BEGIN
    UPDATE user_profiles SET updated_at = datetime('now') WHERE user_id = NEW.user_id;
END;

CREATE TRIGGER IF NOT EXISTS trigger_user_settings_updated_at
AFTER UPDATE ON user_settings
BEGIN
    UPDATE user_settings SET updated_at = datetime('now') WHERE user_id = NEW.user_id;
END;

CREATE TRIGGER IF NOT EXISTS trigger_notes_updated_at
AFTER UPDATE ON notes
BEGIN
    UPDATE notes SET updated_at = datetime('now') WHERE id = NEW.id;
END;

-- ============================================================================
-- DATA INTEGRITY TRIGGERS
-- ============================================================================

-- Auto-create user_settings when user is created
CREATE TRIGGER IF NOT EXISTS trigger_create_user_settings
AFTER INSERT ON users
BEGIN
    INSERT INTO user_settings (user_id, default_visibility, allow_search_index, show_profile)
    VALUES (NEW.id, 'unlisted', 1, 1);
END;

-- Sync view_count when note_views is inserted
CREATE TRIGGER IF NOT EXISTS trigger_sync_view_count
AFTER INSERT ON note_views
BEGIN
    UPDATE notes 
    SET view_count = view_count + 1 
    WHERE id = NEW.note_id;
END;

-- Clear slug when slug_owner is deleted
CREATE TRIGGER IF NOT EXISTS trigger_clear_slug_on_owner_delete
AFTER UPDATE ON notes
WHEN NEW.slug_owner_id IS NULL AND OLD.slug_owner_id IS NOT NULL
BEGIN
    UPDATE notes 
    SET slug = NULL 
    WHERE id = NEW.id;
END;

-- Update ownership_type when owner is deleted
CREATE TRIGGER IF NOT EXISTS trigger_update_ownership_on_owner_delete
AFTER UPDATE ON notes
WHEN NEW.owner_id IS NULL AND OLD.owner_id IS NOT NULL AND NEW.ownership_type = 'user'
BEGIN
    UPDATE notes 
    SET ownership_type = 'anonymous' 
    WHERE id = NEW.id;
END;

-- ============================================================================
-- MIGRATION NOTES
-- ============================================================================
-- 
-- 🎯 Key Design Decisions:
-- 
-- 1. EXPLICIT OWNERSHIP
--    - ownership_type ('user'|'anonymous') makes intent clear
--    - No nullable owner_id ambiguity
--    - Trigger auto-updates ownership_type to 'anonymous' when owner is deleted
-- 
-- 2. THREE-LEVEL VISIBILITY
--    - private: Only owner + collaborators
--    - unlisted: Anyone with link
--    - public: Discoverable
-- 
-- 3. SLUG SYSTEM
--    - Format: /username/slug
--    - Unique per user, not globally
--    - slug_owner_id enables user namespace
--    - Trigger auto-clears slug when slug_owner is deleted
--    - Anonymous notes should NOT have slugs (app-level validation)
-- 
-- 4. SOFT DELETES
--    - note_deletions table preserves data
--    - App-level logic filters deleted notes
--    - Recovery window possible
-- 
-- 5. ANALYTICS READY
--    - note_views tracks all visits
--    - IP hash preserves privacy (use crypto.subtle.digest)
--    - Trigger auto-syncs view_count in notes table
--    - Enables trending, rate limiting, abuse detection
-- 
-- 6. AUDIT TRAIL
--    - All actions logged
--    - Security investigations
--    - User support
-- 
-- 7. AUTO-INITIALIZATION
--    - user_settings auto-created on user signup
--    - Ensures consistent defaults
-- 
-- 8. PERFORMANCE
--    - All common queries have indexes
--    - Composite indexes for multi-column queries
--    - Partial indexes where applicable
-- 
-- ============================================================================
-- APP-LEVEL VALIDATION RULES
-- ============================================================================
-- 
-- Enforce these in your application code:
-- 
-- 1. USERNAME RULES
--    - Lowercase alphanumeric + hyphens only: /^[a-z0-9-]+$/
--    - Length: 3-30 characters
--    - Cannot start/end with hyphen
--    - Reserved words blacklist: admin, api, auth, settings, help, about, etc.
-- 
-- 2. ANONYMOUS NOTES
--    - ownership_type = 'anonymous' → owner_id MUST be NULL
--    - Anonymous notes → slug and slug_owner_id MUST be NULL
--    - Anonymous notes → NO rows in note_access table
--    - Anonymous notes → visibility should be 'unlisted' or 'public' (not 'private')
-- 
-- 3. SLUG RULES
--    - URL-safe: /^[a-z0-9-]+$/
--    - Length: 3-100 characters
--    - If slug is set, slug_owner_id MUST be set
-- 
-- 4. EXPIRATION
--    - If expires_at is set, must be in the future
--    - Background job should clean up expired notes
-- 
-- 5. VISIBILITY RULES
--    - private notes: require authentication, check owner_id or note_access
--    - unlisted notes: anyone with link can view
--    - public notes: discoverable, can be indexed
-- 
-- 6. COLLABORATION
--    - Only 'user' ownership_type notes can have collaborators
--    - Owner implicitly has 'admin' permission (don't store in note_access)
--    - Admin can grant/revoke permissions
-- 
-- 7. IP HASHING (for note_views)
--    - Use SHA-256: crypto.subtle.digest('SHA-256', ip + daily_salt)
--    - Rotate salt daily for privacy
--    - Store as hex string
-- 
-- ============================================================================
-- DEPLOYMENT INSTRUCTIONS
-- ============================================================================
-- 
-- Local testing:
--   wrangler d1 execute zennote-d1 --local --file=./migrations/001_init_production.sql
-- 
-- Production deployment:
--   wrangler d1 execute zennote-d1 --remote --file=./migrations/001_init_production.sql
-- 
-- Verify tables:
--   wrangler d1 execute zennote-d1 --remote --command "SELECT name FROM sqlite_master WHERE type='table';"
-- 
-- ============================================================================

