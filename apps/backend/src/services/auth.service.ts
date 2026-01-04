import { DbService } from './db.service';
import { User } from '../types/auth';
import { UserId } from '../types/note';
import { generateUUID } from '../utils/uuid';
import { toUserId } from '../utils/types';
import { ClerkUserData } from '../utils/clerk';

export class AuthService {
  constructor(private db: DbService) {}

  async getOrCreateUserFromClerk(
    clerkUserId: string,
    email: string,
    clerkUserData?: ClerkUserData | null
  ): Promise<User> {
    const existingByClerk = await this.db.queryOne<User>(
      'SELECT * FROM users WHERE clerk_user_id = ?',
      [clerkUserId]
    );
    if (existingByClerk) {
      return existingByClerk;
    }

    const now = new Date().toISOString();

    // Use real email from Clerk if available, otherwise fall back to provided email
    const realEmail = clerkUserData?.email || email || `${clerkUserId}@clerk.placeholder`;

    // Check if user exists by email (for migration scenarios)
    const existingByEmail = await this.db.queryOne<User>(
      'SELECT * FROM users WHERE email = ?',
      [realEmail]
    );

    if (existingByEmail) {
      // Link existing email-based user to Clerk
      await this.db.execute(
        'UPDATE users SET clerk_user_id = ?, updated_at = ? WHERE id = ?',
        [clerkUserId, now, existingByEmail.id]
      );
      return {
        ...existingByEmail,
        clerk_user_id: clerkUserId,
        updated_at: now,
      };
    }

    // Create new user
    const userId = toUserId(generateUUID());

    await this.db.execute(
      'INSERT INTO users (id, email, clerk_user_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
      [userId, realEmail, clerkUserId, now, now]
    );

    await this.ensureProfile(userId, realEmail, now, clerkUserData);

    return {
      id: userId,
      email: realEmail,
      clerk_user_id: clerkUserId,
      created_at: now,
      updated_at: now,
    };
  }

  async getUserByClerkId(clerkUserId: string): Promise<User | null> {
    return await this.db.queryOne<User>(
      'SELECT * FROM users WHERE clerk_user_id = ?',
      [clerkUserId]
    );
  }

  async getUserById(userId: UserId): Promise<User | null> {
    return await this.db.queryOne<User>('SELECT * FROM users WHERE id = ?', [
      userId,
    ]);
  }

  private async ensureProfile(
    userId: UserId,
    email: string,
    now: string,
    clerkUserData?: ClerkUserData | null
  ): Promise<void> {
    const existing = await this.db.queryOne<{ username: string }>(
      'SELECT username FROM user_profiles WHERE user_id = ?',
      [userId]
    );
    if (existing) return;

    // Use Clerk username if available, otherwise generate from email
    let username: string;
    if (clerkUserData?.username) {
      // Validate and sanitize Clerk username
      const sanitized = clerkUserData.username.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/^-+|-+$/g, '');
      if (sanitized && sanitized.length >= 3 && sanitized.length <= 30) {
        // Check if username is available
        const existingUsername = await this.db.queryOne<{ username: string }>(
          'SELECT username FROM user_profiles WHERE username = ?',
          [sanitized]
        );
        username = existingUsername ? await this.generateUniqueUsername(email) : sanitized;
      } else {
        username = await this.generateUniqueUsername(email);
      }
    } else {
      username = await this.generateUniqueUsername(email);
    }

    // Build display name from Clerk first/last name
    const displayName = clerkUserData?.firstName || clerkUserData?.lastName
      ? [clerkUserData.firstName, clerkUserData.lastName].filter(Boolean).join(' ').trim() || null
      : null;

    // Use Clerk avatar URL if available
    const avatarUrl = clerkUserData?.imageUrl || null;

    await this.db.execute(
      'INSERT OR IGNORE INTO user_profiles (user_id, username, display_name, bio, avatar_url, website_url, location, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [userId, username, displayName, null, avatarUrl, null, null, now, now]
    );
  }

  private async generateUniqueUsername(email: string): Promise<string> {
    const base = email.split('@')[0].toLowerCase().replace(/[^a-z0-9-]/g, '-');
    const sanitized = base.replace(/^-+|-+$/g, '') || 'user';
    const candidate = async (suffix?: string) => {
      const name = suffix ? `${sanitized}-${suffix}` : sanitized;
      const existing = await this.db.queryOne<{ username: string }>(
        'SELECT username FROM user_profiles WHERE username = ?',
        [name]
      );
      return existing ? null : name;
    };

    const direct = await candidate();
    if (direct) return direct;

    for (let i = 0; i < 5; i++) {
      const suffix = Math.random().toString(36).slice(2, 6);
      const withSuffix = await candidate(suffix);
      if (withSuffix) return withSuffix;
    }

    return `${sanitized}-${Date.now()}`;
  }
}
