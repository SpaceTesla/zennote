'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Link } from '@/components/ui/hugeicons';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { config } from '@/config';
import { MarkdownPreview } from '@/components/notes/markdown-preview';

export const runtime = 'edge';

interface Note {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export default function NotePage() {
  const { id } = useParams();
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchNote() {
      try {
        const response = await fetch(
          `${config.api.baseUrl}${config.api.endpoints.notes.get(id as string)}`,
        );

        if (!response.ok) {
          throw new Error(
            response.status === 404 ? 'Note not found' : 'Failed to fetch note',
          );
        }

        const data = await response.json();
        setNote(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchNote();
  }, [id]);

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl space-y-6">
      {loading && <p className="text-center py-10">Loading note...</p>}

      {error && (
        <div className="bg-destructive/10 border border-destructive text-destructive p-4 rounded-lg">
          {error}
        </div>
      )}

      {note && (
        <>
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start gap-4 flex-wrap">
                <div className="space-y-2">
                  <Badge variant="secondary">Public note</Badge>
                  <h1 className="text-3xl font-bold">{note.title}</h1>
                  <p className="text-sm text-muted-foreground">
                    Last updated: {new Date(note.updated_at).toLocaleDateString()}
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
        </>
      )}
    </div>
  );
}
