'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { MarkdownPreview } from '@/components/notes/markdown-preview';
import { useSharedNote } from '@/lib/queries/notes.queries';
import { Link as LinkIcon, Calendar, Globe, Lock, Edit } from '@/components/ui/hugeicons';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface SharedNoteClientProps {
  noteId: string;
}

export function SharedNoteClient({ noteId }: SharedNoteClientProps) {
  const router = useRouter();
  const { data: note, isLoading, error } = useSharedNote(noteId);
  const [copyMdLabel, setCopyMdLabel] = useState('Copy Markdown');

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl space-y-6">
        <Skeleton className="h-12 w-3/4 mb-4" />
        <Skeleton className="h-4 w-48 mb-8" />
        <Skeleton className="h-96 w-full rounded-lg" />
      </div>
    );
  }

  if (!note || error) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight">Note not available</h1>
        <p className="text-muted-foreground">
          This note may be private, expired, or does not exist.
        </p>
      </div>
    );
  }

  const displayDate = format(new Date(note.updated_at || note.created_at), 'MMM d, yyyy');

  const canEdit = note?.user_permission === 'owner' || note?.user_permission === 'admin' || note?.user_permission === 'write';

  return (
    <div className="min-h-screen bg-background">
      {note && canEdit && (
        <div className="bg-muted/40 border-b border-border py-2.5 px-4 mb-6">
          <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
            <span className="text-sm text-muted-foreground flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              You have edit access to this note
            </span>
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1 text-xs cursor-pointer"
              render={
                <Link href={`/notes/${note.id}`} className="inline-flex items-center gap-1.5">
                  <Edit className="h-3.5 w-3.5" />
                  Manage Note
                </Link>
              }
            />
          </div>
        </div>
      )}
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
                  <time dateTime={note.updated_at || note.created_at}>{displayDate}</time>
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

              <div className="flex items-center gap-2">
                <Button
                  onClick={() => {
                    if (!note?.content) return;
                    navigator.clipboard.writeText(note.content);
                    setCopyMdLabel('Copied!');
                    setTimeout(() => setCopyMdLabel('Copy Markdown'), 2000);
                  }}
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-accent-foreground hover:text-accent-foreground/80 cursor-pointer"
                  title="Copy markdown to clipboard"
                >
                  {copyMdLabel}
                </Button>
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
                  <LinkIcon className="h-4 w-4 mr-2" />
                  Copy link
                </Button>
              </div>
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
