'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="line-clamp-2 mb-2">
              <Link
                href={`/notes/${note.id}`}
                className="hover:text-primary transition-colors"
              >
                {note.title}
              </Link>
            </CardTitle>
            <CardDescription>
              {format(new Date(note.updated_at), 'MMM d, yyyy')}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {note.is_public ? (
              <Badge variant="outline">
                <Globe className="h-3 w-3 mr-1" />
                Public
              </Badge>
            ) : (
              <Badge variant="outline">
                <Lock className="h-3 w-3 mr-1" />
                Private
              </Badge>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /><span className="sr-only">More options</span></Button>} />
              <DropdownMenuContent align="end">
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
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-3">{excerpt}</p>
      </CardContent>
      <CardFooter>
        <Button variant="ghost" size="sm" render={<Link href={`/notes/${note.id}`}>View Note</Link>} className="w-full" />
      </CardFooter>
    </Card>
  );
}
