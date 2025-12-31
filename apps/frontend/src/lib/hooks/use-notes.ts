import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useNotes as useNotesQuery, useNote, useCreateNote, useUpdateNote, useDeleteNote, noteKeys } from '../queries/notes.queries';
import { NotesQueryParams, Note } from '@/types/note';
import { notesApi } from '../api/notes';

const defaultFilters: NotesQueryParams = {
  page: 1,
  limit: 20,
  sortBy: 'updated_at',
  sortOrder: 'desc',
};

export function useNotes() {
  const [filters, setFilters] = useState<NotesQueryParams>(defaultFilters);
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [noteLoading, setNoteLoading] = useState(false);
  const [noteError, setNoteError] = useState<Error | null>(null);
  const queryClient = useQueryClient();

  const listQuery = useNotesQuery(filters);
  const createMutation = useCreateNote();
  const updateMutation = useUpdateNote();
  const deleteMutation = useDeleteNote();
  const mutationsPending =
    createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  const fetchNotes = useCallback((params?: NotesQueryParams) => {
    setFilters((prev) => ({ ...prev, ...(params || {}) }));
  }, []);

  const fetchNote = useCallback(async (id: string): Promise<Note | null> => {
    if (!id) return null;
    setNoteLoading(true);
    setNoteError(null);
    try {
      const data = await queryClient.fetchQuery({
        queryKey: noteKeys.detail(id),
        queryFn: () => notesApi.getNote(id),
        staleTime: 5 * 60 * 1000,
      });
      setCurrentNote(data);
      setNoteError(null);
      return data;
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to fetch note');
      setNoteError(err);
      setCurrentNote(null);
      throw error;
    } finally {
      setNoteLoading(false);
    }
  }, [queryClient]);

  const createNote = async (input: Parameters<typeof createMutation.mutateAsync>[0]) =>
    createMutation.mutateAsync(input);

  const updateNote = async (id: string, data: any) =>
    updateMutation.mutateAsync({ id, data });

  const deleteNote = async (id: string) => deleteMutation.mutateAsync(id);

  return {
    notes: (listQuery.data?.data as Note[]) || [],
    currentNote,
    pagination: listQuery.data?.meta?.pagination || null,
    filters,
    isLoading: listQuery.isLoading || noteLoading || mutationsPending,
    error: listQuery.error || noteError,
    fetchNotes,
    fetchNote,
    createNote,
    updateNote,
    deleteNote,
    setFilters,
    setPagination: (page: number, limit?: number) =>
      setFilters((prev) => ({ ...prev, page, ...(limit ? { limit } : {}) })),
    clearNotes: () => queryClient.removeQueries({ queryKey: noteKeys.all }),
    clearError: () => {
      setNoteError(null);
    },
  };
}


