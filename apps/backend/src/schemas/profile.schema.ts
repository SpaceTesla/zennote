import { z } from 'zod';

export const updateProfileSchema = z.object({
  display_name: z.string().min(1).max(100).optional(),
  bio: z.string().max(1000).optional().nullable(),
  avatar_url: z.string().url().max(500).optional().nullable(),
  website: z.string().url().max(500).optional().nullable(),
  location: z.string().max(100).optional().nullable(),
});

export const updateSocialLinksSchema = z.object({
  links: z.array(
    z.object({
      platform: z.string().min(1).max(50),
      url: z.string().url().max(500),
    })
  ),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type UpdateSocialLinksInput = z.infer<typeof updateSocialLinksSchema>;

