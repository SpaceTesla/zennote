'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { MarkdownPreview } from '@/components/notes/markdown-preview';
import { useNotes } from '@/lib/hooks/use-notes';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Share2, Edit, Lock, Globe, FileText } from '@/components/ui/hugeicons';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export const runtime = 'edge';

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
      <main className="container mx-auto px-4 py-12 max-w-4xl space-y-4">
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-32 mb-4" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-12 max-w-4xl space-y-6">
      <header className="rounded-2xl border border-border/70 bg-white/70 dark:bg-background/70 backdrop-blur-xl p-6 shadow-card-ambient">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex-1 space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">
              <FileText className="h-4 w-4" />
              Zen note
            </div>
            <h1 className="text-3xl font-bold tracking-tight">{currentNote.title}</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
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
            <Button variant="ghost" size="sm" className="border border-border/70">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
      </header>
      <article className="prose prose-lg dark:prose-invert max-w-none rounded-2xl border border-border/70 bg-white/70 dark:bg-background/60 backdrop-blur-xl p-6 shadow-card-ambient">
        <MarkdownPreview content={currentNote.content} className="min-h-[400px]" />
      </article>
    </main>
  );
}

