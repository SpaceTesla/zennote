import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notesApi } from '../api/notes';
import {
  NotesQueryParams,
  UpdateNoteInput,
  CreateNoteInput,
  Note,
} from '@/types/note';

export const noteKeys = {
  all: ['notes'] as const,
  lists: () => [...noteKeys.all, 'list'] as const,
  list: (filters: NotesQueryParams | undefined) => [
    ...noteKeys.lists(),
    filters || {},
  ] as const,
  details: () => [...noteKeys.all, 'detail'] as const,
  detail: (id: string) => [...noteKeys.details(), id] as const,
  collaborators: (id: string) => [...noteKeys.detail(id), 'collaborators'] as const,
  sharedDetail: (id: string) => [...noteKeys.details(), 'shared', id] as const,
};

export function useNotes(params?: NotesQueryParams) {
  return useQuery({
    queryKey: noteKeys.list(params),
    queryFn: () => notesApi.getNotes(params),
    staleTime: 5 * 60 * 1000,
  });
}

export function useNote(id: string) {
  return useQuery({
    queryKey: noteKeys.detail(id),
    queryFn: () => notesApi.getNote(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useSharedNote(id: string) {
  return useQuery({
    queryKey: noteKeys.sharedDetail(id),
    queryFn: () => notesApi.getSharedNote(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateNoteInput) => notesApi.createNote(input),
    onMutate: async (newNote) => {
      await queryClient.cancelQueries({ queryKey: noteKeys.lists() });
      const previous = queryClient.getQueryData(noteKeys.lists());
      queryClient.setQueryData(noteKeys.lists(), (old: any) => ({
        ...old,
        data: [{ ...(newNote as Note), id: `temp-${Date.now()}` }, ...(old?.data || [])],
      }));
      return { previous };
    },
    onError: (_err, _newNote, context) => {
      if (context?.previous) {
        queryClient.setQueryData(noteKeys.lists(), context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: noteKeys.lists() });
    },
  });
}

export function useUpdateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateNoteInput }) =>
      notesApi.updateNote(id, data),
    onSuccess: (note, variables) => {
      queryClient.setQueryData(noteKeys.detail(variables.id), note);
      queryClient.invalidateQueries({ queryKey: noteKeys.lists() });
    },
  });
}

export function useDeleteNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notesApi.deleteNote(id),
    onSuccess: (_data, id) => {
      queryClient.removeQueries({ queryKey: noteKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: noteKeys.lists() });
    },
  });
}

export function useCollaborators(id: string) {
  return useQuery({
    queryKey: noteKeys.collaborators(id),
    queryFn: () => notesApi.getCollaborators(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}


