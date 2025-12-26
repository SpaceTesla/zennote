import { NoteId, UserId } from '../types/note';

export function toNoteId(id: string): NoteId {
  return id as NoteId;
}

export function toUserId(id: string): UserId {
  return id as UserId;
}

export function isNoteId(id: string): id is NoteId {
  return typeof id === 'string' && id.length > 0;
}

export function isUserId(id: string): id is UserId {
  return typeof id === 'string' && id.length > 0;
}

