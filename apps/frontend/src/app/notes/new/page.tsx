'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { NoteEditorLayout } from '@/components/notes/note-editor-layout';
import { NoteSettings } from '@/components/notes/note-settings';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNotes } from '@/lib/hooks/use-notes';
import { useAuth } from '@/lib/hooks/use-auth';
import { toast } from 'sonner';
import { ProtectedRoute } from '@/components/auth/protected-route';

export default function NewNotePage() {
  const router = useRouter();
  const { createNote, isLoading } = useNotes();
  const { isAuthenticated } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPublic, setIsPublic] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    try {
      await createNote({
        title: title.trim(),
        content,
        is_public: isPublic,
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
    const draft = { title, content, isPublic };
    localStorage.setItem('note-draft', JSON.stringify(draft));
  }, [title, content, isPublic]);

  // Load draft on mount
  useEffect(() => {
    const draftStr = localStorage.getItem('note-draft');
    if (draftStr) {
      try {
        const draft = JSON.parse(draftStr);
        setTitle(draft.title || '');
        setContent(draft.content || '');
        setIsPublic(draft.isPublic || false);
      } catch (e) {
        // Ignore parse errors
      }
    }
  }, []);

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8 flex flex-col flex-1 max-w-6xl">
        <div className="flex items-center justify-between mb-2 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Badge>New</Badge>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              New Note
            </h1>
          </div>
          <NoteSettings
            title={title}
            isPublic={isPublic}
            onTitleChange={setTitle}
            onPublicChange={setIsPublic}
            isPermanent={isAuthenticated}
          />
        </div>
        <Card className="flex-shrink-0 mb-4">
          <CardContent className="pt-4">
            <Input
              type="text"
              placeholder="Enter note title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-lg font-semibold"
            />
          </CardContent>
        </Card>
        <div className="flex-1 min-h-0">
          <NoteEditorLayout
            content={content}
            onContentChange={setContent}
            onSave={handleSave}
            onCancel={handleCancel}
            isLoading={isLoading}
            className="border rounded-lg"
          />
        </div>
      </div>
    </ProtectedRoute>
  );
}
