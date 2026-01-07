'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MarkdownPreview } from '@/components/notes/markdown-preview';
import { useNote, useSharedNote } from '@/lib/queries/notes.queries';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { Share2, Edit, Lock, Globe, Calendar, Link as LinkIcon } from '@/components/ui/hugeicons';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ApiError } from '@/types/api';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { profilesApi } from '@/lib/api/profiles';

export const runtime = 'edge';

export default function ViewNotePage() {
  const params = useParams();
  const noteId = params.id as string;
  const router = useRouter();
  const redirectChecked = useRef(false);
  const { data: currentNote, isLoading, error } = useNote(noteId);
  const sharedQuery = useSharedNote(noteId);
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [shareLoading, setShareLoading] = useState(false);
  const [shareLabel, setShareLabel] = useState('Share');
  const shareResetRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (redirectChecked.current || !noteId) return;
    if (error instanceof ApiError && error.statusCode === 404) {
      sharedQuery
        .refetch()
        .then((result) => {
          if (result.data && result.data.visibility !== 'private') {
            redirectChecked.current = true;
            router.replace(`/s/${noteId}`);
          }
        })
        .catch(() => {
          // stay on error state
        });
    }
  }, [error, noteId, router, sharedQuery]);

  const canEdit = useMemo(() => {
    const level = currentNote?.user_permission;
    return level === 'owner' || level === 'admin' || level === 'write';
  }, [currentNote?.user_permission]);

  useEffect(() => {
    async function buildShareLink() {
      if (!currentNote) return;
      if (currentNote.visibility === 'private') {
        setShareLink(null);
        return;
      }

      // Unlisted or anonymous → /s/:id
      if (currentNote.visibility === 'unlisted' || currentNote.ownership_type === 'anonymous') {
        setShareLink(`${window.location.origin}/s/${currentNote.id}`);
        return;
      }

      // Public → prefer /u/:username/:slug
      if (currentNote.visibility === 'public') {
        if (!currentNote.slug) {
          setShareLink(null);
          return;
        }
        const ownerId = currentNote.slug_owner_id || currentNote.owner_id;
        if (!ownerId) {
          setShareLink(null);
          return;
        }
        try {
          setShareLoading(true);
          const profile = await profilesApi.getProfile(ownerId);
          if (profile?.username) {
            setShareLink(`${window.location.origin}/u/${profile.username}/${currentNote.slug}`);
          } else {
            setShareLink(null);
          }
        } catch {
          setShareLink(null);
        } finally {
          setShareLoading(false);
        }
      }
    }

    buildShareLink();
  }, [currentNote]);

  const shareDisabled =
    !currentNote ||
    currentNote.visibility === 'private' ||
    (currentNote.visibility === 'public' && (!currentNote.slug || !shareLink)) ||
    shareLoading;

  useEffect(() => {
    return () => {
      if (shareResetRef.current) {
        clearTimeout(shareResetRef.current);
      }
    };
  }, []);

  return (
    <ProtectedRoute>
      {isLoading ? (
        <div className="container mx-auto px-4 py-12 max-w-4xl space-y-6">
          <Skeleton className="h-12 w-3/4 mb-4" />
          <Skeleton className="h-4 w-48 mb-8" />
          <Skeleton className="h-96 w-full rounded-lg" />
        </div>
      ) : error || !currentNote ? (
        <div className="container mx-auto px-4 py-12 max-w-4xl space-y-4">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight">Error Loading Note</h1>
            <p className="text-muted-foreground text-sm">
              {error instanceof ApiError
                ? error.message
                : error instanceof Error
                ? error.message
                : 'Failed to load note. It may not exist or you may not have permission to view it.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="min-h-screen bg-background">
          <div className="container mx-auto py-2 pb-8">
            <div className="max-w-3xl bg-accent/60 mx-auto px-6 py-4 rounded-lg">
              <header>
                <h1 className="text-2xl md:text-3xl font-bold leading-tight tracking-tight text-accent-foreground">
                  {currentNote.title}
                </h1>

                <div className="flex flex-wrap items-end justify-between gap-4 pt-1">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      {format(new Date(currentNote.updated_at || currentNote.created_at), 'MMM d, yyyy')}
                    </span>

                    {currentNote.visibility === 'public' && (
                      <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-secondary text-xs">
                        <Globe className="h-3 w-3" />
                        Public
                      </span>
                    )}
                    {currentNote.visibility === 'unlisted' && (
                      <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-secondary text-xs">
                        <Lock className="h-3 w-3" />
                        Unlisted
                      </span>
                    )}
                    {currentNote.visibility === 'private' && (
                      <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-secondary text-xs">
                        <Lock className="h-3 w-3" />
                        Private
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {canEdit && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-accent-foreground hover:text-accent-foreground/80"
                        render={
                          <Link href={`/notes/${noteId}/edit`} className="inline-flex items-center gap-2">
                            <Edit className="h-4 w-4" />
                            Edit
                          </Link>
                        }
                      />
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 w-28 justify-center text-accent-foreground hover:text-accent-foreground/80"
                      disabled={shareDisabled}
                      onClick={() => {
                        if (!shareLink) return;
                        if (shareResetRef.current) {
                          clearTimeout(shareResetRef.current);
                        }
                        navigator.clipboard.writeText(shareLink);
                        setShareLabel('Copied');
                        shareResetRef.current = setTimeout(() => {
                          setShareLabel('Share');
                        }, 2000);
                      }}
                      title="Copy link to clipboard"
                    >
                      <LinkIcon className="h-4 w-4 mr-2" />
                      {shareDisabled ? 'Share (unavailable)' : shareLabel}
                    </Button>
                  </div>
                </div>
              </header>
            </div>

            <article>
              <MarkdownPreview content={currentNote.content} className="min-h-[400px]" />
            </article>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}
