export type NoteId = string & { __brand: 'NoteId' };
export type UserId = string & { __brand: 'UserId' };

export type PermissionLevel = 'read' | 'write' | 'admin' | 'owner';
export type Visibility = 'private' | 'unlisted' | 'public';
export type OwnershipType = 'user' | 'anonymous';

export interface Note {
  id: NoteId;
  title: string;
  content: string;
  ownership_type: OwnershipType;
  owner_id: UserId | null;
  visibility: Visibility;
  slug: string | null;
  slug_owner_id: UserId | null;
  is_editable: boolean;
  expires_at: string | null;
  view_count: number;
  created_at: string;
  updated_at: string;
}

export interface CreateNoteInput {
  title: string;
  content: string;
  visibility: Visibility;
  ownership_type?: OwnershipType;
  slug?: string | null;
  slug_owner_id?: UserId | null;
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
  note_id: NoteId;
  user_id: UserId;
  permission_level: PermissionLevel;
  granted_by: UserId;
  created_at: string;
}

export interface NoteWithAccess extends Note {
  user_permission?: PermissionLevel;
}

