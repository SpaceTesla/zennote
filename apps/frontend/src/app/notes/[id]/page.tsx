'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { MarkdownPreview } from '@/components/notes/markdown-preview';
import { useNotes } from '@/lib/hooks/use-notes';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Share2, Edit, Lock, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function ViewNotePage() {
  const params = useParams();
  const noteId = params.id as string;
  const { currentNote, fetchNote, isLoading } = useNotes();

  useEffect(() => {
    if (noteId) {
      fetchNote(noteId);
    }
  }, [noteId, fetchNote]);

  if (isLoading || !currentNote) {
    return (
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Skeleton className="h-8 w-64 mb-4" />
        <Skeleton className="h-4 w-32 mb-8" />
        <Skeleton className="h-96 w-full" />
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <header className="mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{currentNote.title}</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Created {format(new Date(currentNote.created_at), 'MMM d, yyyy')}</span>
              {currentNote.updated_at !== currentNote.created_at && (
                <>
                  <span>•</span>
                  <span>Updated {format(new Date(currentNote.updated_at), 'MMM d, yyyy')}</span>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {currentNote.is_public ? (
              <Badge variant="outline" className="gap-1">
                <Globe className="h-3 w-3" />
                Public
              </Badge>
            ) : (
              <Badge variant="outline" className="gap-1">
                <Lock className="h-3 w-3" />
                Private
              </Badge>
            )}
            <Button variant="outline" size="sm" asChild>
              <Link href={`/notes/${noteId}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Link>
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
      </header>
      <article className="prose prose-lg dark:prose-invert max-w-none">
        <MarkdownPreview content={currentNote.content} className="min-h-[400px]" />
      </article>
    </main>
  );
}

