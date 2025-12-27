export type PermissionLevel = 'read' | 'write' | 'admin';

export interface Note {
  id: string;
  title: string;
  content: string;
  is_public: boolean;
  is_permanent: boolean;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
  owner_id?: string;
}

export interface CreateNoteInput {
  title: string;
  content: string;
  is_public?: boolean;
}

export interface UpdateNoteInput {
  title?: string;
  content?: string;
  is_public?: boolean;
}

export interface NoteAccess {
  note_id: string;
  user_id: string;
  permission_level: PermissionLevel;
  granted_by: string;
  created_at: string;
}

export interface ShareNoteInput {
  userId: string;
  permissionLevel: PermissionLevel;
}

export interface NotesQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: 'created_at' | 'updated_at' | 'title';
  sortOrder?: 'asc' | 'desc';
  userId?: string;
}

