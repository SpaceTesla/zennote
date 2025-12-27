'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { NoteList } from '@/components/notes/note-list';
import { NoteSearch } from '@/components/notes/note-search';
import { NoteFilters } from '@/components/notes/note-filters';
import { Button } from '@/components/ui/button';
import { useNotes } from '@/lib/hooks/use-notes';
import { useDebounce } from '@/lib/hooks/use-debounce';
import { useAuth } from '@/lib/hooks/use-auth';
import { toast } from 'sonner';
import { Plus } from '@/components/ui/hugeicons';
import Link from 'next/link';

export default function NotesPage() {
  const router = useRouter();
  const { notes, pagination, filters, isLoading, fetchNotes, setFilters, deleteNote } = useNotes();
  const { isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 500);

  useEffect(() => {
    fetchNotes({ ...filters, search: debouncedSearch || undefined });
  }, [debouncedSearch, filters.sortBy, filters.sortOrder, filters.page]);

  const handlePageChange = (page: number) => {
    setFilters({ page });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this note?')) {
      try {
        await deleteNote(id);
        toast.success('Note deleted successfully');
      } catch (error) {
        toast.error('Failed to delete note');
      }
    }
  };

  const handleEdit = (id: string) => {
    router.push(`/notes/${id}/edit`);
  };

  return (
    <main className="container mx-auto px-4 py-12 max-w-7xl space-y-8">
      <header className="rounded-2xl border border-border/70 bg-white/70 dark:bg-background/70 backdrop-blur-xl p-6 shadow-card-ambient">
        <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">My Notes</h1>
            <p className="text-muted-foreground">
              {pagination?.total || 0} note{pagination?.total !== 1 ? 's' : ''} · crafted in Nova
            </p>
          </div>
          {isAuthenticated && (
            <Button asChild size="lg" className="shadow-glow">
              <Link href="/notes/new">
                <Plus className="h-4 w-4 mr-2" />
                New Note
              </Link>
            </Button>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <NoteSearch value={searchQuery} onChange={setSearchQuery} />
          </div>
          <NoteFilters filters={filters} onFiltersChange={setFilters} />
        </div>
      </header>

      <section aria-label="Notes list" className="space-y-4">
        <NoteList
          notes={notes}
          isLoading={isLoading}
          pagination={pagination}
          onPageChange={handlePageChange}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </section>
    </main>
  );
}

