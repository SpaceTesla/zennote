import { z } from 'zod';

const visibilityEnum = z.enum(['private', 'unlisted', 'public']);
const ownershipEnum = z.enum(['user', 'anonymous']);

const slugRegex = /^[a-z0-9-]{3,100}$/;

export const createNoteSchema = z.object({
  title: z.string().min(1).max(500),
  content: z.string().min(1).max(100000),
  visibility: visibilityEnum,
  ownership_type: ownershipEnum.optional().default('user'),
  slug: z.string().regex(slugRegex).nullable().optional(),
  is_editable: z.boolean().optional().default(true),
  expires_at: z.string().datetime().nullable().optional(),
});

export const updateNoteSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  content: z.string().min(1).max(100000).optional(),
  visibility: visibilityEnum.optional(),
  slug: z.string().regex(slugRegex).nullable().optional(),
  is_editable: z.boolean().optional(),
  expires_at: z.string().datetime().nullable().optional(),
});

export const shareNoteSchema = z.object({
  user_id: z.string().uuid(),
  permission_level: z.enum(['read', 'write', 'admin']),
});

export type CreateNoteInput = z.infer<typeof createNoteSchema>;
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;
export type ShareNoteInput = z.infer<typeof shareNoteSchema>;

