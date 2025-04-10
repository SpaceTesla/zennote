// Example component for listing notes (apps/frontend/src/components/notes-list.tsx)
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Note {
  id: string;
  title: string;
  created_at: string;
}

export default function NotesList() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNotes() {
      try {
        const response = await fetch(
          'https://zennote-worker.shivansh-karan.workers.dev/notes',
        );
        if (response.ok) {
          const data = await response.json();
          setNotes(data);
        }
      } catch (error) {
        console.error('Failed to fetch notes:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchNotes();
  }, []);

  if (loading) return <p>Loading notes...</p>;

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">Your Notes</h2>
      {notes.length === 0 ? (
        <p className="text-muted-foreground">
          No notes yet. Create your first note above.
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {notes.map((note) => (
            <Link
              key={note.id}
              href={`/notes/${note.id}`}
              className="p-4 bg-card rounded-md border border-border hover:border-primary/50 transition"
            >
              <h3 className="font-medium">{note.title}</h3>
              <p className="text-sm text-muted-foreground mt-2">
                {new Date(note.created_at).toLocaleDateString()}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
