'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { MarkdownPreview } from '@/components/notes/markdown-preview';
import { useNotes } from '@/lib/hooks/use-notes';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
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
      <div className="container mx-auto px-4 py-12 max-w-4xl space-y-4">
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-32 mb-4" />
        <Skeleton className="h-96 w-full rounded-lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex-1 space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">
                <FileText className="h-3 w-3" />
                Note
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
                <Badge variant="outline">
                  <Globe className="h-3 w-3 mr-1" />
                  Public
                </Badge>
              ) : (
                <Badge variant="outline">
                  <Lock className="h-3 w-3 mr-1" />
                  Private
                </Badge>
              )}
              <Button variant="outline" size="sm" render={<Link href={`/notes/${noteId}/edit`}><Edit className="h-4 w-4 mr-2" />Edit</Link>} />
              <Button variant="ghost" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <article className="prose prose-lg dark:prose-invert max-w-none">
            <MarkdownPreview content={currentNote.content} className="min-h-[400px]" />
          </article>
        </CardContent>
      </Card>
    </div>
  );
}
