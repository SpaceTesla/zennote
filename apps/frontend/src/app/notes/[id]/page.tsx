'use client';

import { useParams } from 'next/navigation';
import { MarkdownPreview } from '@/components/notes/markdown-preview';
import { useNote } from '@/lib/queries/notes.queries';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { Share2, Edit, Lock, Globe } from '@/components/ui/hugeicons';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ApiError } from '@/types/api';

export const runtime = 'edge';

export default function ViewNotePage() {
  const params = useParams();
  const noteId = params.id as string;
  const { data: currentNote, isLoading, error } = useNote(noteId);

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 max-w-3xl space-y-4">
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-32 mb-4" />
        <Skeleton className="h-96 w-full rounded-lg" />
      </div>
    );
  }

  if (error || !currentNote) {
    const errorMessage =
      error instanceof ApiError
        ? error.message
        : error instanceof Error
        ? error.message
        : 'Failed to load note. It may not exist or you may not have permission to view it.';

    return (
      <div className="container mx-auto p-4 max-w-3xl space-y-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">Error Loading Note</h1>
          <p className="text-muted-foreground text-sm">{errorMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 pb-12 max-w-3xl space-y-6">
      <header className="space-y-3">
        <h1 className="text-4xl font-semibold leading-tight tracking-tight text-foreground">
          {currentNote.title}
        </h1>
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span>
            Created {format(new Date(currentNote.created_at), 'MMM d, yyyy')}
          </span>
          {currentNote.updated_at !== currentNote.created_at && (
            <>
              <span>•</span>
              <span>
                Updated {format(new Date(currentNote.updated_at), 'MMM d, yyyy')}
              </span>
            </>
          )}
          <span>•</span>
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-muted/50">
            {currentNote.visibility === 'public' ? (
              <>
                <Globe className="h-3 w-3" />
                Public
              </>
            ) : currentNote.visibility === 'unlisted' ? (
              'Unlisted'
            ) : (
              <>
                <Lock className="h-3 w-3" />
                Private
              </>
            )}
          </span>
          <div className="flex items-center gap-2 ml-auto">
            <Button
              variant="ghost"
              size="sm"
              render={
                <Link href={`/notes/${noteId}/edit`} className="inline-flex items-center gap-2">
                  <Edit className="h-4 w-4" />
                  Edit
                </Link>
              }
            />
            <Button variant="ghost" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
      </header>
      <article className="prose prose-lg dark:prose-invert max-w-none">
        <MarkdownPreview
          content={currentNote.content}
          className="min-h-[400px]"
        />
      </article>
    </div>
  );
}
