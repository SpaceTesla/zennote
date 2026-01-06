'use client';

import { Note } from '@/types/note';
import { NoteCard } from './note-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { PaginationMeta } from '@/types/api';
import { ChevronLeft, ChevronRight } from '@/components/ui/hugeicons';

interface NoteListProps {
  notes: Note[];
  isLoading?: boolean;
  pagination?: PaginationMeta | null;
  onPageChange?: (page: number) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onShare?: (id: string) => void;
}

export function NoteList({
  notes,
  isLoading,
  pagination,
  onPageChange,
  onEdit,
  onDelete,
  onShare,
}: NoteListProps) {
  if (isLoading) {
    return (
      <div className="grid gap-8 md:grid-cols-2">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="rounded-xl border border-border/40 bg-muted/10 p-5">
            <Skeleton className="h-6 w-3/4 mb-3" />
            <Skeleton className="h-4 w-1/2 mb-4" />
            <Skeleton className="h-16 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (notes.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No notes found. Create your first note!</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-8 md:grid-cols-2">
        {notes.map((note) => (
          <NoteCard
            key={note.id}
            note={note}
            onEdit={onEdit}
            onDelete={onDelete}
            onShare={onShare}
          />
        ))}
      </div>
      {pagination && pagination.total > pagination.limit && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-muted-foreground">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
            {pagination.total} notes
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(pagination.page - 1)}
              disabled={pagination.page === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(pagination.page + 1)}
              disabled={!pagination.hasMore}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
