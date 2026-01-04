export type PermissionLevel = 'read' | 'write' | 'admin';
export type Visibility = 'private' | 'unlisted' | 'public';
export type OwnershipType = 'user' | 'anonymous';

export interface Note {
  id: string;
  title: string;
  content: string;
  ownership_type: OwnershipType;
  owner_id: string | null;
  visibility: Visibility;
  slug: string | null;
  slug_owner_id: string | null;
  is_editable: boolean;
  expires_at: string | null;
  view_count: number;
  created_at: string;
  updated_at: string;
  user_permission?: PermissionLevel;
}

export interface CreateNoteInput {
  title: string;
  content: string;
  visibility: Visibility;
  ownership_type?: OwnershipType;
  slug?: string | null;
  is_editable?: boolean;
  expires_at?: string | null;
}

export interface UpdateNoteInput {
  title?: string;
  content?: string;
  visibility?: Visibility;
  slug?: string | null;
  is_editable?: boolean;
  expires_at?: string | null;
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

