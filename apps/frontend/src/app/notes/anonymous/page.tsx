'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { NoteEditorLayout } from '@/components/notes/note-editor-layout';
import { Badge } from '@/components/ui/badge';
import { notesApi } from '@/lib/api/notes';
import { toast } from 'sonner';
import { Visibility } from '@/types/note';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InfoIcon } from '@/components/ui/hugeicons';

export default function AnonymousNotePage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [visibility, setVisibility] = useState<Visibility>('unlisted');
  const [slug, setSlug] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    if (!content.trim()) {
      toast.error('Please enter some content');
      return;
    }

    // Validate slug if provided for public notes
    if (visibility === 'public' && slug.trim() && slug.trim().length < 3) {
      toast.error('Slug must be at least 3 characters long');
      return;
    }

    setIsLoading(true);
    try {
      // Calculate expiration date: 7 days from now
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);
      const expiresAtISO = expiresAt.toISOString();

      const note = await notesApi.createNote({
        title: title.trim(),
        content,
        visibility,
        ownership_type: 'anonymous',
        slug: visibility === 'public' && slug.trim() && slug.trim().length >= 3 ? slug.trim() : undefined,
        expires_at: expiresAtISO,
      });

      toast.success('Anonymous note created! It will expire in 7 days.');
      router.push(`/notes/${note.id}`);
    } catch (error) {
      console.error('Error creating anonymous note:', error);
      toast.error('Failed to create note. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/');
  };

  // Auto-save draft to localStorage
  useEffect(() => {
    const draft = { title, content, visibility, slug, isAnonymous: true };
    localStorage.setItem('anonymous-note-draft', JSON.stringify(draft));
  }, [title, content, visibility, slug]);

  // Load draft on mount
  useEffect(() => {
    const draftStr = localStorage.getItem('anonymous-note-draft');
    if (draftStr) {
      try {
        const draft = JSON.parse(draftStr);
        setTitle(draft.title || '');
        setContent(draft.content || '');
        setVisibility(draft.visibility || 'unlisted');
        setSlug(draft.slug || '');
      } catch (e) {
        // Ignore parse errors
      }
    }
  }, []);

  return (
    <div className="container mx-auto p-4 flex flex-col flex-1 gap-2 max-w-7xl min-h-0">
      <div className="flex items-center gap-2 mb-2 flex-shrink-0">
        <Badge variant="secondary">Anonymous</Badge>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          Create Anonymous Note
        </h1>
      </div>
      <Alert className="mb-4 flex-shrink-0">
        <InfoIcon className="h-4 w-4" />
        <AlertDescription>
          This note will automatically expire in 7 days. No account required.
        </AlertDescription>
      </Alert>
      <div className="flex-1 min-h-0 flex flex-col">
        <NoteEditorLayout
          content={content}
          onContentChange={setContent}
          onSave={handleSave}
          onCancel={handleCancel}
          isLoading={isLoading}
          className="border rounded-lg"
          title={title}
          onTitleChange={setTitle}
          titlePlaceholder="Enter note title..."
          visibility={visibility}
          onVisibilityChange={setVisibility}
          slug={slug}
          onSlugChange={setSlug}
          isAnonymous={true}
        />
      </div>
    </div>
  );
}

