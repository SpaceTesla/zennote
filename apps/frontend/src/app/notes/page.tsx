'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { NoteList } from '@/components/notes/note-list';
import { NoteSearch } from '@/components/notes/note-search';
import { NoteFilters } from '@/components/notes/note-filters';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useNotes } from '@/lib/hooks/use-notes';
import { useDebounce } from '@/lib/hooks/use-debounce';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { toast } from 'sonner';
import { Plus } from '@/components/ui/hugeicons';
import Link from 'next/link';

export default function NotesPage() {
  const router = useRouter();
  const { notes, pagination, filters, isLoading, error, fetchNotes, setFilters, deleteNote } = useNotes();
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 500);

  useEffect(() => {
    fetchNotes({ ...filters, search: debouncedSearch || undefined });
  }, [debouncedSearch, filters.sortBy, filters.sortOrder, filters.page, fetchNotes]);

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
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-12 max-w-7xl space-y-8">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <CardTitle className="text-2xl">My Notes</CardTitle>
                <CardDescription>
                  {pagination?.total || 0} note{pagination?.total !== 1 ? 's' : ''}
                </CardDescription>
              </div>
              <Button render={<Link href="/notes/new"><Plus className="h-4 w-4 mr-2" />New Note</Link>} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <NoteSearch value={searchQuery} onChange={setSearchQuery} />
              </div>
              <NoteFilters filters={filters} onFiltersChange={setFilters} />
            </div>
          </CardContent>
        </Card>

        {error && (
          <Card>
            <CardContent className="pt-6">
              <p className="text-destructive text-sm">
                {error instanceof Error ? error.message : 'Failed to load notes. Please try again.'}
              </p>
            </CardContent>
          </Card>
        )}
        <section aria-label="Notes list">
          <NoteList
            notes={notes}
            isLoading={isLoading}
            pagination={pagination}
            onPageChange={handlePageChange}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </section>
      </div>
    </ProtectedRoute>
  );
}
