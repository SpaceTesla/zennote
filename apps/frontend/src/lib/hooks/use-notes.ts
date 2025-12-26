import { useNotesStore } from '@/lib/stores/notes-store';

export function useNotes() {
  const {
    notes,
    currentNote,
    pagination,
    filters,
    isLoading,
    error,
    fetchNotes,
    fetchNote,
    createNote,
    updateNote,
    deleteNote,
    setFilters,
    setPagination,
    clearNotes,
    clearError,
  } = useNotesStore();

  return {
    notes,
    currentNote,
    pagination,
    filters,
    isLoading,
    error,
    fetchNotes,
    fetchNote,
    createNote,
    updateNote,
    deleteNote,
    setFilters,
    setPagination,
    clearNotes,
    clearError,
  };
}

