'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { NoteEditorLayout } from '@/components/notes/note-editor-layout';
import { NoteSettings } from '@/components/notes/note-settings';
import { useNotes } from '@/lib/hooks/use-notes';
import { useAuth } from '@/lib/hooks/use-auth';
import { toast } from 'sonner';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Skeleton } from '@/components/ui/skeleton';

export const runtime = 'edge';

export default function EditNotePage() {
  const params = useParams();
  const router = useRouter();
  const noteId = params.id as string;
  const { currentNote, fetchNote, updateNote, deleteNote, isLoading } = useNotes();
  const { isAuthenticated } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPublic, setIsPublic] = useState(false);

  useEffect(() => {
    if (noteId) {
      fetchNote(noteId);
    }
  }, [noteId, fetchNote]);

  useEffect(() => {
    if (currentNote) {
      setTitle(currentNote.title);
      setContent(currentNote.content);
      setIsPublic(currentNote.is_public);
    }
  }, [currentNote]);

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    try {
      await updateNote(noteId, {
        title: title.trim(),
        content,
        is_public: isPublic,
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
        <div className="container mx-auto px-4 py-8 h-[calc(100vh-140px)] space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-[calc(100%-80px)] w-full rounded-2xl" />
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8 h-[calc(100vh-140px)] space-y-4 max-w-6xl">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">
              Edit
            </span>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Edit Note</h1>
          </div>
          <NoteSettings
            title={title}
            isPublic={isPublic}
            onTitleChange={setTitle}
            onPublicChange={setIsPublic}
            onDelete={handleDelete}
            isPermanent={currentNote.is_permanent}
            expiresAt={currentNote.expires_at}
          />
        </div>
        <NoteEditorLayout
          content={content}
          onContentChange={setContent}
          onSave={handleSave}
          onCancel={handleCancel}
          isLoading={isLoading}
          className="border border-border/70 rounded-2xl shadow-card-ambient"
        />
      </div>
    </ProtectedRoute>
  );
}

