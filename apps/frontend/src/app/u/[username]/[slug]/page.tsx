'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Link, Calendar, Globe, Lock } from '@/components/ui/hugeicons';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { MarkdownPreview } from '@/components/notes/markdown-preview';
import { notesApi } from '@/lib/api/notes';
import { Note } from '@/types/note';
import { ApiError } from '@/types/api';
import { format } from 'date-fns';

export const runtime = 'edge';

export default function PublicNotePage() {
  const params = useParams();
  const username = params.username as string;
  const slug = params.slug as string;
  const router = useRouter();
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchNote() {
      if (!username || !slug) return;
      
      try {
        setLoading(true);
        setError(null);
        const fetchedNote = await notesApi.getNoteBySlug(username, slug);
        setNote(fetchedNote);
      } catch (err) {
        const errorMessage =
          err instanceof ApiError
            ? err.message
            : err instanceof Error
            ? err.message
            : 'Failed to load note. It may not exist or you may not have permission to view it.';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    }

    fetchNote();
  }, [username, slug]);

  useEffect(() => {
    if (note?.user_permission === 'owner') {
      router.replace(`/notes/${note.id}`);
    }
  }, [note?.user_permission, note?.id, router]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl space-y-6">
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-32 mb-4" />
        <Skeleton className="h-96 w-full rounded-lg" />
      </div>
    );
  }

  if (error || !note) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight">Error loading note</h1>
        <p className="text-muted-foreground">{error || 'Note not found'}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-2 pb-8">
        <div className="max-w-3xl bg-accent/60 mx-auto px-6 py-4 rounded-lg">
          <header>
            <h1 className="text-2xl md:text-3xl font-bold leading-tight tracking-tight text-accent-foreground">
              {note.title}
            </h1>

            <div className="flex flex-wrap items-end justify-between gap-4 pt-1">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  {format(new Date(note.updated_at || note.created_at), 'MMM d, yyyy')}
                </span>

                {note.visibility === 'public' && (
                  <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-secondary text-xs">
                    <Globe className="h-3 w-3" />
                    Public
                  </span>
                )}
                {note.visibility === 'unlisted' && (
                  <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-secondary text-xs">
                    <Lock className="h-3 w-3" />
                    Unlisted
                  </span>
                )}
              </div>

              <Button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  toast.success('Link copied to clipboard');
                }}
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-accent-foreground hover:text-accent-foreground/80 cursor-pointer"
                title="Copy link to clipboard"
              >
                <Link className="h-4 w-4 mr-2" />
                Copy link
              </Button>
            </div>
          </header>
        </div>

        <article>
          <MarkdownPreview content={note.content} className="min-h-[400px]" />
        </article>
      </div>
    </div>
  );
}

