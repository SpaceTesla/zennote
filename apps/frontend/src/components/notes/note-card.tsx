'use client';

import Link from 'next/link';
import { Note } from '@/types/note';
import { format } from 'date-fns';
import { Globe, Lock, Edit, Trash2, Share2, MoreVertical } from '@/components/ui/hugeicons';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface NoteCardProps {
  note: Note;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onShare?: (id: string) => void;
}

export function NoteCard({ note, onEdit, onDelete, onShare }: NoteCardProps) {
  const excerpt = note.content.length > 150
    ? note.content.substring(0, 150) + '...'
    : note.content;

  return (
    <article className="group relative rounded-xl border border-border/40 bg-muted/10 p-5 transition-colors hover:bg-muted/30">
      <div className="absolute right-3 top-3 opacity-0 transition-opacity group-hover:opacity-100">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button
                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:text-foreground focus:outline-none"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">More options</span>
              </button>
            }
          />
          <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
            {onEdit && (
              <DropdownMenuItem onClick={() => onEdit(note.id)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
            )}
            {onShare && (
              <DropdownMenuItem onClick={() => onShare(note.id)}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </DropdownMenuItem>
            )}
            {onDelete && (
              <DropdownMenuItem
                onClick={() => onDelete(note.id)}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Link href={`/notes/${note.id}`} className="block space-y-3">
        <div className="space-y-2 pr-10">
          <h3 className="text-xl font-medium tracking-tight text-foreground line-clamp-2 group-hover:text-foreground">
            {note.title}
          </h3>
          <p className="text-sm text-muted-foreground leading-6 line-clamp-3">
            {excerpt}
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>{format(new Date(note.updated_at), 'MMM d, yyyy')}</span>
          <span>•</span>
          <span className="inline-flex items-center gap-1 rounded-full bg-muted/60 px-2 py-1">
            {note.visibility === 'public' ? (
              <>
                <Globe className="h-3 w-3" />
                Public
              </>
            ) : note.visibility === 'unlisted' ? (
              'Unlisted'
            ) : (
              <>
                <Lock className="h-3 w-3" />
                Private
              </>
            )}
          </span>
        </div>
      </Link>
    </article>
  );
}
