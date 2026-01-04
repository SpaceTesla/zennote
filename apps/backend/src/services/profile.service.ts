import { DbService } from './db.service';
import { CacheService } from './cache.service';
import {
  UserProfile,
  UpdateProfileInput,
  UserSettings,
  UpdateSettingsInput,
} from '../types/profile';
import { UserId } from '../types/note';
import { createError, ErrorCode } from '../utils/errors';
import { CACHE_TTL } from '../utils/cache';

const RESERVED_USERNAMES = ['admin', 'api', 'auth', 'settings', 'help', 'about'];

export class ProfileService {
  constructor(private db: DbService, private cache: CacheService) {}

  async getProfileByUserId(userId: UserId): Promise<UserProfile | null> {
    const cacheKey = this.cache.profileKey(userId);
    const cached = await this.cache.get<UserProfile>(cacheKey);
    if (cached) return cached;

    const profile = await this.db.queryOne<UserProfile>(
      'SELECT * FROM user_profiles WHERE user_id = ?',
      [userId]
    );
    if (profile) {
      await this.cache.set(cacheKey, profile, CACHE_TTL.PROFILE_PUBLIC);
    }
    return profile;
  }

  async getProfileByUsername(username: string): Promise<UserProfile | null> {
    return await this.db.queryOne<UserProfile>(
      'SELECT * FROM user_profiles WHERE username = ?',
      [username]
    );
  }

  async updateProfile(
    userId: UserId,
    input: UpdateProfileInput
  ): Promise<UserProfile> {
    const updates: string[] = [];
    const params: unknown[] = [];

    if (input.username !== undefined) {
      this.validateUsername(input.username);
      updates.push('username = ?');
      params.push(input.username.toLowerCase());
    }
    if (input.display_name !== undefined) {
      updates.push('display_name = ?');
      params.push(input.display_name);
    }
    if (input.bio !== undefined) {
      updates.push('bio = ?');
      params.push(input.bio);
    }
    if (input.avatar_url !== undefined) {
      updates.push('avatar_url = ?');
      params.push(input.avatar_url);
    }
    if (input.website_url !== undefined) {
      updates.push('website_url = ?');
      params.push(input.website_url);
    }
    if (input.location !== undefined) {
      updates.push('location = ?');
      params.push(input.location);
    }

    if (updates.length === 0) {
      const profile = await this.db.queryOne<UserProfile>(
        'SELECT * FROM user_profiles WHERE user_id = ?',
        [userId]
      );
      if (!profile) {
        throw createError(ErrorCode.NOT_FOUND, 'Profile not found', 404);
      }
      return profile;
    }

    updates.push('updated_at = ?');
    params.push(new Date().toISOString());
    params.push(userId);

    try {
      await this.db.execute(
        `UPDATE user_profiles SET ${updates.join(', ')} WHERE user_id = ?`,
        params
      );
    } catch (err: unknown) {
      const message = (err as Error).message || '';
      if (message.includes('UNIQUE') && message.includes('username')) {
        throw createError(ErrorCode.CONFLICT, 'Username already taken', 409);
      }
      throw err;
    }

    const profile = await this.db.queryOne<UserProfile>(
      'SELECT * FROM user_profiles WHERE user_id = ?',
      [userId]
    );

    if (!profile) {
      throw createError(ErrorCode.NOT_FOUND, 'Profile not found', 404);
    }

    await this.cache.invalidateUser(userId);
    return profile;
  }

  async getSettings(userId: UserId): Promise<UserSettings | null> {
    return await this.db.queryOne<UserSettings>(
      'SELECT * FROM user_settings WHERE user_id = ?',
      [userId]
    );
  }

  async updateSettings(
    userId: UserId,
    input: UpdateSettingsInput
  ): Promise<UserSettings> {
    const updates: string[] = [];
    const params: unknown[] = [];

    if (input.default_visibility !== undefined) {
      updates.push('default_visibility = ?');
      params.push(input.default_visibility);
    }
    if (input.allow_search_index !== undefined) {
      updates.push('allow_search_index = ?');
      params.push(input.allow_search_index ? 1 : 0);
    }
    if (input.show_profile !== undefined) {
      updates.push('show_profile = ?');
      params.push(input.show_profile ? 1 : 0);
    }

    if (updates.length > 0) {
      updates.push('updated_at = ?');
      params.push(new Date().toISOString());
      params.push(userId);

      await this.db.execute(
        `UPDATE user_settings SET ${updates.join(', ')} WHERE user_id = ?`,
        params
      );
    }

    const settings = await this.getSettings(userId);
    if (!settings) {
      throw createError(ErrorCode.NOT_FOUND, 'Settings not found', 404);
    }

    await this.cache.invalidateUser(userId);
    return settings;
  }

  private validateUsername(username: string) {
    const lower = username.toLowerCase();
    if (RESERVED_USERNAMES.includes(lower)) {
      throw createError(ErrorCode.CONFLICT, 'Username is reserved', 409);
    }
  }
}

