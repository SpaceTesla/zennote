import { create } from 'zustand';
import { Note, NotesQueryParams } from '@/types/note';
import { notesApi } from '@/lib/api/notes';
import { PaginationMeta } from '@/types/api';
import { ApiError } from '@/types/api';

interface NotesState {
  notes: Note[];
  currentNote: Note | null;
  pagination: PaginationMeta | null;
  filters: NotesQueryParams;
  isLoading: boolean;
  error: string | null;
  fetchNotes: (params?: NotesQueryParams) => Promise<void>;
  fetchNote: (id: string) => Promise<void>;
  createNote: (input: { title: string; content: string; is_public?: boolean }) => Promise<Note>;
  updateNote: (id: string, input: { title?: string; content?: string; is_public?: boolean }) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  setFilters: (filters: Partial<NotesQueryParams>) => void;
  setPagination: (pagination: PaginationMeta) => void;
  clearNotes: () => void;
  clearError: () => void;
}

export const useNotesStore = create<NotesState>((set, get) => ({
  notes: [],
  currentNote: null,
  pagination: null,
  filters: {
    page: 1,
    limit: 20,
    sortBy: 'updated_at',
    sortOrder: 'desc',
  },
  isLoading: false,
  error: null,

  fetchNotes: async (params?: NotesQueryParams) => {
    set({ isLoading: true, error: null });
    try {
      const queryParams = { ...get().filters, ...params };
      const response = await notesApi.getNotes(queryParams);
      set({
        notes: response.data || [],
        pagination: response.meta?.pagination || null,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Failed to fetch notes';
      set({
        isLoading: false,
        error: message,
      });
    }
  },

  fetchNote: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const note = await notesApi.getNote(id);
      set({
        currentNote: note,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Failed to fetch note';
      set({
        isLoading: false,
        error: message,
        currentNote: null,
      });
    }
  },

  createNote: async (input) => {
    set({ isLoading: true, error: null });
    try {
      const note = await notesApi.createNote(input);
      // Optimistically add to list
      set((state) => ({
        notes: [note, ...state.notes],
        isLoading: false,
        error: null,
      }));
      return note;
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Failed to create note';
      set({
        isLoading: false,
        error: message,
      });
      throw error;
    }
  },

  updateNote: async (id: string, input) => {
    set({ isLoading: true, error: null });
    try {
      const updatedNote = await notesApi.updateNote(id, input);
      // Update in list
      set((state) => ({
        notes: state.notes.map((n) => (n.id === id ? updatedNote : n)),
        currentNote: state.currentNote?.id === id ? updatedNote : state.currentNote,
        isLoading: false,
        error: null,
      }));
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Failed to update note';
      set({
        isLoading: false,
        error: message,
      });
      throw error;
    }
  },

  deleteNote: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await notesApi.deleteNote(id);
      // Remove from list
      set((state) => ({
        notes: state.notes.filter((n) => n.id !== id),
        currentNote: state.currentNote?.id === id ? null : state.currentNote,
        isLoading: false,
        error: null,
      }));
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Failed to delete note';
      set({
        isLoading: false,
        error: message,
      });
      throw error;
    }
  },

  setFilters: (filters) => {
    set((state) => ({
      filters: { ...state.filters, ...filters },
    }));
  },

  setPagination: (pagination) => {
    set({ pagination });
  },

  clearNotes: () => {
    set({
      notes: [],
      currentNote: null,
      pagination: null,
    });
  },

  clearError: () => {
    set({ error: null });
  },
}));

