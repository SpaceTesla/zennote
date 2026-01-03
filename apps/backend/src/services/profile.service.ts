import { DbService } from './db.service';
import { CacheService } from './cache.service';
import {
  UserProfile,
  SocialLink,
  UpdateProfileInput,
  UpdateSocialLinksInput,
  ProfileWithSocials,
} from '../types/profile';
import { UserId } from '../types/note';
import { generateUUID } from '../utils/uuid';
import { createError, ErrorCode } from '../utils/errors';
import { CACHE_TTL } from '../utils/cache';

export class ProfileService {
  constructor(private db: DbService, private cache: CacheService) {}

  async getProfile(userId: UserId): Promise<ProfileWithSocials | null> {
    // Check cache
    const cacheKey = this.cache.profileKey(userId);
    const cached = await this.cache.get<ProfileWithSocials>(cacheKey);
    if (cached) {
      return cached;
    }

    const profile = await this.db.queryOne<UserProfile>(
      'SELECT * FROM user_profiles WHERE user_id = ?',
      [userId]
    );

    if (!profile) {
      return null;
    }

    const socials = await this.db.query<SocialLink>(
      'SELECT * FROM user_socials WHERE user_id = ? ORDER BY platform',
      [userId]
    );

    const profileWithSocials: ProfileWithSocials = {
      ...profile,
      socials: socials.results || [],
    };

    // Cache profile (public profiles cached longer)
    const ttl = CACHE_TTL.PROFILE_PUBLIC;
    await this.cache.set(cacheKey, profileWithSocials, ttl);

    return profileWithSocials;
  }

  async updateProfile(
    userId: UserId,
    input: UpdateProfileInput
  ): Promise<UserProfile> {
    const updates: string[] = [];
    const params: unknown[] = [];

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
    if (input.website !== undefined) {
      updates.push('website = ?');
      params.push(input.website);
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

    await this.db.execute(
      `UPDATE user_profiles SET ${updates.join(', ')} WHERE user_id = ?`,
      params
    );

    const profile = await this.db.queryOne<UserProfile>(
      'SELECT * FROM user_profiles WHERE user_id = ?',
      [userId]
    );

    if (!profile) {
      throw createError(ErrorCode.NOT_FOUND, 'Profile not found', 404);
    }

    // Invalidate cache
    await this.cache.invalidateUser(userId);

    return profile;
  }

  async updateSocialLinks(
    userId: UserId,
    input: UpdateSocialLinksInput
  ): Promise<SocialLink[]> {
    // Delete existing social links
    await this.db.execute('DELETE FROM user_socials WHERE user_id = ?', [
      userId,
    ]);

    // Insert new social links
    for (const link of input.links) {
      const id = generateUUID();
      await this.db.execute(
        'INSERT INTO user_socials (id, user_id, platform, url, created_at) VALUES (?, ?, ?, ?, ?)',
        [id, userId, link.platform, link.url, new Date().toISOString()]
      );
    }

    const socials = await this.db.query<SocialLink>(
      'SELECT * FROM user_socials WHERE user_id = ? ORDER BY platform',
      [userId]
    );

    // Invalidate cache
    await this.cache.invalidateUser(userId);

    return socials.results || [];
  }

  async getSocialLinks(userId: UserId): Promise<SocialLink[]> {
    const socials = await this.db.query<SocialLink>(
      'SELECT * FROM user_socials WHERE user_id = ? ORDER BY platform',
      [userId]
    );
    return socials.results || [];
  }
}
