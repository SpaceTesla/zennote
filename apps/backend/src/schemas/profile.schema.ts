import { z } from 'zod';

const usernameRegex = /^[a-z0-9](?:[a-z0-9-]{1,28}[a-z0-9])?$/; // 3-30 chars, no leading/trailing hyphen

export const updateProfileSchema = z.object({
  username: z.string().regex(usernameRegex).min(3).max(30).optional(),
  display_name: z.string().min(1).max(100).optional().nullable(),
  bio: z.string().max(1000).optional().nullable(),
  avatar_url: z.string().url().max(500).optional().nullable(),
  website_url: z.string().url().max(500).optional().nullable(),
  location: z.string().max(100).optional().nullable(),
});

export const updateSettingsSchema = z.object({
  default_visibility: z.enum(['private', 'unlisted', 'public']).optional(),
  allow_search_index: z.boolean().optional(),
  show_profile: z.boolean().optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;

