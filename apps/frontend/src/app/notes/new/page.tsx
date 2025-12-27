'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { NoteEditorLayout } from '@/components/notes/note-editor-layout';
import { NoteSettings } from '@/components/notes/note-settings';
import { Input } from '@/components/ui/input';
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
      <div className="container mx-auto px-4 py-8 h-[calc(100vh-140px)] space-y-4 max-w-6xl">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">
              New
            </span>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">New Note</h1>
          </div>
          <NoteSettings
            title={title}
            isPublic={isPublic}
            onTitleChange={setTitle}
            onPublicChange={setIsPublic}
            isPermanent={isAuthenticated}
          />
        </div>
        <div className="mb-4 rounded-xl border border-border/70 bg-white/70 dark:bg-background/70 backdrop-blur-xl p-4 shadow-card-ambient">
          <Input
            type="text"
            placeholder="Enter note title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-lg font-semibold"
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

