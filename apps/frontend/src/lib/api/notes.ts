import { apiClient } from './client';
import { config } from '@/config';
import { StandardResponse, PaginatedResponse } from '@/types/api';
import { Note, CreateNoteInput, UpdateNoteInput, ShareNoteInput, NoteAccess, NotesQueryParams } from '@/types/note';

export const notesApi = {
  async getNotes(params?: NotesQueryParams): Promise<PaginatedResponse<Note>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) {
      // Convert to uppercase as backend expects 'ASC' or 'DESC'
      queryParams.append('sortOrder', params.sortOrder.toUpperCase());
    }
    if (params?.userId) queryParams.append('userId', params.userId);

    const url = `${config.api.endpoints.notes.list}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await apiClient.get<Note[]>(url);

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to fetch notes');
    }

    return {
      ...response,
      data: response.data,
    } as PaginatedResponse<Note>;
  },

  async getNote(id: string): Promise<Note> {
    const response = await apiClient.get<Note>(config.api.endpoints.notes.get(id));

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to fetch note');
    }

    return response.data;
  },

  async getSharedNote(id: string): Promise<Note> {
    const response = await apiClient.get<Note>(config.api.endpoints.notes.getShared(id));

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to fetch shared note');
    }

    return response.data;
  },

  async getNoteBySlug(username: string, slug: string): Promise<Note> {
    const response = await apiClient.get<Note>(config.api.endpoints.notes.getBySlug(username, slug));

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to fetch note');
    }

    return response.data;
  },

  async createNote(input: CreateNoteInput): Promise<Note> {
    const response = await apiClient.post<Note>(
      config.api.endpoints.notes.create,
      input
    );

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to create note');
    }

    return response.data;
  },

  async updateNote(id: string, input: UpdateNoteInput): Promise<Note> {
    const response = await apiClient.put<Note>(
      config.api.endpoints.notes.update(id),
      input
    );

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to update note');
    }

    return response.data;
  },

  async deleteNote(id: string): Promise<void> {
    const response = await apiClient.delete<void>(config.api.endpoints.notes.delete(id));

    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to delete note');
    }
  },

  async shareNote(id: string, input: ShareNoteInput): Promise<void> {
    const response = await apiClient.post<void>(
      config.api.endpoints.notes.share(id),
      input
    );

    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to share note');
    }
  },

  async revokeAccess(id: string, userId: string): Promise<void> {
    const response = await apiClient.delete<void>(
      config.api.endpoints.notes.revokeAccess(id, userId)
    );

    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to revoke access');
    }
  },

  async getCollaborators(id: string): Promise<NoteAccess[]> {
    const response = await apiClient.get<NoteAccess[]>(
      config.api.endpoints.notes.collaborators(id)
    );

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to fetch collaborators');
    }

    return response.data;
  },
};

