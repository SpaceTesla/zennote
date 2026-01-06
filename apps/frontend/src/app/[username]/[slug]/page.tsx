'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Link } from '@/components/ui/hugeicons';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { MarkdownPreview } from '@/components/notes/markdown-preview';
import { notesApi } from '@/lib/api/notes';
import { Note } from '@/types/note';
import { ApiError } from '@/types/api';
import { format } from 'date-fns';
import { Globe, Lock } from '@/components/ui/hugeicons';

export const runtime = 'edge';

export default function PublicNotePage() {
  const params = useParams();
  const username = params.username as string;
  const slug = params.slug as string;
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
      <div className="container mx-auto px-4 py-12 max-w-4xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Error Loading Note</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              {error || 'Note not found'}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start gap-4 flex-wrap">
            <div className="space-y-2">
              <Badge variant="secondary">
                {note.visibility === 'public' ? (
                  <>
                    <Globe className="h-3 w-3 mr-1" />
                    Public note
                  </>
                ) : (
                  <>
                    <Lock className="h-3 w-3 mr-1" />
                    Unlisted note
                  </>
                )}
              </Badge>
              <h1 className="text-3xl font-bold">{note.title}</h1>
              <p className="text-sm text-muted-foreground">
                Last updated: {format(new Date(note.updated_at), 'MMM d, yyyy')}
              </p>
            </div>
            <Button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                toast.success('Link copied to clipboard');
              }}
              variant="outline"
              aria-label="Copy link"
              title="Copy link to clipboard"
            >
              <Link className="h-4 w-4 mr-2" />
              Copy link
            </Button>
          </div>
        </CardHeader>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <MarkdownPreview content={note.content} className="max-h-[75vh]" />
        </CardContent>
      </Card>
    </div>
  );
}

