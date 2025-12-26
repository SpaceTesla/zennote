import { z } from 'zod';

export const createNoteSchema = z.object({
  title: z.string().min(1).max(500),
  content: z.string().min(1).max(100000),
  is_public: z.boolean().optional().default(false),
});

export const updateNoteSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  content: z.string().min(1).max(100000).optional(),
  is_public: z.boolean().optional(),
});

export const shareNoteSchema = z.object({
  user_id: z.string().uuid(),
  permission_level: z.enum(['read', 'write', 'admin']),
});

export type CreateNoteInput = z.infer<typeof createNoteSchema>;
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;
export type ShareNoteInput = z.infer<typeof shareNoteSchema>;

