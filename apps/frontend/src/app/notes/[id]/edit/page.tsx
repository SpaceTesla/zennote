'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { NoteEditorLayout } from '@/components/notes/note-editor-layout';
import { useNotes } from '@/lib/hooks/use-notes';
import { toast } from 'sonner';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Skeleton } from '@/components/ui/skeleton';
import { Visibility } from '@/types/note';

export const runtime = 'edge';

export default function EditNotePage() {
  const params = useParams();
  const router = useRouter();
  const noteId = params.id as string;
  const { currentNote, fetchNote, updateNote, deleteNote, isLoading } =
    useNotes();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [visibility, setVisibility] = useState<Visibility>('unlisted');
  const [slug, setSlug] = useState('');

  useEffect(() => {
    if (noteId) {
      fetchNote(noteId);
    }
  }, [noteId, fetchNote]);

  useEffect(() => {
    if (currentNote) {
      setTitle(currentNote.title);
      setContent(currentNote.content);
      setVisibility(currentNote.visibility);
      setSlug(currentNote.slug || '');
    }
  }, [currentNote]);

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    // Validate slug if provided for public notes
    if (visibility === 'public' && slug.trim() && slug.trim().length < 3) {
      toast.error('Slug must be at least 3 characters long');
      return;
    }

    try {
      await updateNote(noteId, {
        title: title.trim(),
        content,
        visibility,
        slug: visibility === 'public' && slug.trim() && slug.trim().length >= 3 
          ? slug.trim() 
          : visibility !== 'public' 
            ? null 
            : undefined,
      });
      toast.success('Note updated successfully!');
      router.push(`/notes/${noteId}`);
    } catch (error) {
      toast.error('Failed to update note');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteNote(noteId);
      toast.success('Note deleted successfully!');
      router.push('/notes');
    } catch (error) {
      toast.error('Failed to delete note');
    }
  };

  const handleCancel = () => {
    router.push(`/notes/${noteId}`);
  };

  if (isLoading || !currentNote) {
    return (
      <ProtectedRoute>
        <div className="container mx-auto p-4 flex flex-col flex-1 gap-2 max-w-7xl min-h-0">
          <Skeleton className="h-8 w-64 mb-4" />
          <Skeleton className="flex-1 w-full rounded-lg" />
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto p-4 flex flex-col flex-1 gap-4 max-w-6xl min-h-0">
        <NoteEditorLayout
          content={content}
          onContentChange={setContent}
          onSave={handleSave}
          onCancel={handleCancel}
          isLoading={isLoading}
          className="border border-border/40 rounded-xl"
          title={title}
          onTitleChange={setTitle}
          titlePlaceholder="Untitled note"
          visibility={visibility}
          onVisibilityChange={setVisibility}
          slug={slug}
          onSlugChange={setSlug}
        />
      </div>
    </ProtectedRoute>
  );
}
