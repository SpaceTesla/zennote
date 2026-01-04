'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { NoteEditorLayout } from '@/components/notes/note-editor-layout';
import { NoteSettings } from '@/components/notes/note-settings';
import { Badge } from '@/components/ui/badge';
import { useNotes } from '@/lib/hooks/use-notes';
import { toast } from 'sonner';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Visibility } from '@/types/note';

export default function NewNotePage() {
  const router = useRouter();
  const { createNote, isLoading } = useNotes();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [visibility, setVisibility] = useState<Visibility>('private');

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    try {
      await createNote({
        title: title.trim(),
        content,
        visibility,
      });
      toast.success('Note created successfully!');
      router.push('/notes');
    } catch (error) {
      toast.error('Failed to create note');
    }
  };

  const handleCancel = () => {
    router.push('/notes');
  };

  // Auto-save draft to localStorage
  useEffect(() => {
    const draft = { title, content, visibility };
    localStorage.setItem('note-draft', JSON.stringify(draft));
  }, [title, content, visibility]);

  // Load draft on mount
  useEffect(() => {
    const draftStr = localStorage.getItem('note-draft');
    if (draftStr) {
      try {
        const draft = JSON.parse(draftStr);
        setTitle(draft.title || '');
        setContent(draft.content || '');
        setVisibility(draft.visibility || 'private');
      } catch (e) {
        // Ignore parse errors
      }
    }
  }, []);

  return (
    <ProtectedRoute>
      <div className="container mx-auto p-4 flex flex-col flex-1 gap-2 max-w-7xl min-h-0">
        <div className="flex items-center justify-between mb-2 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Badge>New</Badge>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              New Note
            </h1>
          </div>
          <NoteSettings
            title={title}
            visibility={visibility}
            onTitleChange={setTitle}
            onVisibilityChange={setVisibility}
          />
        </div>
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
          />
        </div>
      </div>
    </ProtectedRoute>
  );
}
