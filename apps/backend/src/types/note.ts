export type NoteId = string & { __brand: 'NoteId' };
export type UserId = string & { __brand: 'UserId' };

export type PermissionLevel = 'read' | 'write' | 'admin' | 'owner';

export interface Note {
  id: NoteId;
  title: string;
  content: string;
  is_public: boolean;
  is_permanent: boolean;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
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
  note_id: NoteId;
  user_id: UserId;
  permission_level: PermissionLevel;
  granted_by: UserId;
  created_at: string;
}

export interface NoteWithAccess extends Note {
  owner_id?: UserId;
  user_permission?: PermissionLevel;
}

