-- Add users table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Add user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
    user_id TEXT PRIMARY KEY NOT NULL,
    display_name TEXT,
    bio TEXT,
    avatar_url TEXT,
    website TEXT,
    location TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Add user_socials table
CREATE TABLE IF NOT EXISTS user_socials (
    id TEXT PRIMARY KEY NOT NULL,
    user_id TEXT NOT NULL,
    platform TEXT NOT NULL,
    url TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(user_id, platform)
);

-- Add columns to notes table
ALTER TABLE notes ADD COLUMN expires_at TEXT;
ALTER TABLE notes ADD COLUMN is_public INTEGER DEFAULT 0;
ALTER TABLE notes ADD COLUMN is_permanent INTEGER DEFAULT 0;

-- Add user_notes junction table for ownership
CREATE TABLE IF NOT EXISTS user_notes (
    user_id TEXT NOT NULL,
    note_id TEXT NOT NULL,
    is_owner INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, note_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE
);

-- Add note_access table for sharing
CREATE TABLE IF NOT EXISTS note_access (
    note_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    permission_level TEXT NOT NULL CHECK(permission_level IN ('read', 'write', 'admin')),
    granted_by TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (note_id, user_id),
    FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (granted_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_notes_expires_at ON notes(expires_at);
CREATE INDEX IF NOT EXISTS idx_notes_is_public ON notes(is_public);
CREATE INDEX IF NOT EXISTS idx_notes_user_public_expires ON notes(is_public, expires_at);
CREATE INDEX IF NOT EXISTS idx_user_notes_user_id ON user_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notes_note_id ON user_notes(note_id);
CREATE INDEX IF NOT EXISTS idx_note_access_note_id ON note_access(note_id);
CREATE INDEX IF NOT EXISTS idx_note_access_user_id ON note_access(user_id);
CREATE INDEX IF NOT EXISTS idx_note_access_composite ON note_access(note_id, user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_socials_user_id ON user_socials(user_id);
CREATE INDEX IF NOT EXISTS idx_user_socials_composite ON user_socials(user_id, platform);

