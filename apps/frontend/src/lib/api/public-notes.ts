import { apiClient } from './client';
import { config } from '@/config';
import { ApiError, StandardResponse } from '@/types/api';
import { PublicNoteListItem, PublicNoteMetadata } from '@/types/note';

type PublicNoteListResponse = { notes: PublicNoteListItem[] };

async function handleResponse<T>(response: StandardResponse<T>): Promise<T> {
  if (!response.success || !response.data) {
    throw new ApiError(
      response.error?.code || 'UNKNOWN_ERROR',
      response.error?.message || 'Failed to fetch public note data',
      500
    );
  }

  return response.data;
}

export const publicNotesApi = {
  async getMetadataById(id: string): Promise<PublicNoteMetadata> {
    const response = await apiClient.get<PublicNoteMetadata>(
      config.api.endpoints.publicNotes.metadata(id)
    );
    return handleResponse(response);
  },

  async getMetadataBySlug(username: string, slug: string): Promise<PublicNoteMetadata> {
    const response = await apiClient.get<PublicNoteMetadata>(
      config.api.endpoints.publicNotes.metadataBySlug(username, slug)
    );
    return handleResponse(response);
  },

  async listPublicNotes(): Promise<PublicNoteListItem[]> {
    const response = await apiClient.get<PublicNoteListResponse>(
      config.api.endpoints.publicNotes.list
    );
    const payload = await handleResponse(response);
    return payload.notes;
  },
};
