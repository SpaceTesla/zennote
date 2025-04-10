'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Link } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';
import remarkBreaks from 'remark-breaks';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { config } from '@/config';

interface Note {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export const runtime = 'edge';

export default function NotePage() {
  const { id } = useParams();
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchNote() {
      try {
        const response = await fetch(
          `${config.api.baseUrl}${config.api.endpoints.note(id as string)}`,
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
    <main className="flex-1 container mx-auto px-4 py-8 md:py-16 max-w-5xl">
      {loading && <p className="text-center py-10">Loading note...</p>}

      {error && (
        <div className="bg-destructive/10 border border-destructive text-destructive p-4 rounded-md">
          {error}
        </div>
      )}

      {note && (
        <div>
          <div className="mb-6">
            <div className="mb-6 flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold mb-2">{note.title}</h1>
                <div className="text-sm text-muted-foreground">
                  Last updated: {new Date(note.updated_at).toLocaleDateString()}
                </div>
              </div>
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  toast.success('Link copied to clipboard');
                }}
                variant={'secondary'}
                aria-label="Copy link"
                title="Copy link to clipboard"
                className={'cursor-pointer'}
              >
                <Link />
              </Button>
            </div>
          </div>
          <div className="bg-card rounded-lg shadow-sm p-6">
            <div
              className="prose prose-zinc dark:prose-invert max-w-none
                         prose-headings:font-bold prose-a:text-blue-600
                         prose-ul:list-disc prose-ol:list-decimal
                         prose-li:my-1 prose-p:my-2
                         prose-h1:mt-8 prose-h1:mb-4 prose-h2:mt-6 prose-h2:mb-3
                         prose-h3:mt-4 prose-h3:mb-2"
            >
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkBreaks]}
                rehypePlugins={[rehypeHighlight]}
                components={{
                  ul: ({ node, ...props }) => (
                    <ul className="list-disc pl-5 my-4" {...props} />
                  ),
                  ol: ({ node, ...props }) => (
                    <ol className="list-decimal pl-5 my-4" {...props} />
                  ),
                  li: ({ node, ...props }) => (
                    <li className="ml-2 my-1" {...props} />
                  ),
                  p: ({ node, ...props }) => <p className="my-2" {...props} />,
                  h1: ({ node, ...props }) => (
                    <h1
                      className="text-2xl font-bold mt-8 mb-4 pb-1 border-b"
                      {...props}
                    />
                  ),
                  h2: ({ node, ...props }) => (
                    <h2
                      className="text-xl font-semibold mt-6 mb-3"
                      {...props}
                    />
                  ),
                  h3: ({ node, ...props }) => (
                    <h3 className="text-lg font-medium mt-4 mb-2" {...props} />
                  ),
                  h4: ({ node, ...props }) => (
                    <h4
                      className="text-base font-medium mt-3 mb-1"
                      {...props}
                    />
                  ),
                }}
              >
                {note.content}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
