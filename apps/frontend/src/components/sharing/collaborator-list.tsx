'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { NoteAccess } from '@/types/note';
import { X } from 'lucide-react';
import { toast } from 'sonner';

interface CollaboratorListProps {
  noteId: string;
  collaborators?: NoteAccess[];
}

export function CollaboratorList({ noteId, collaborators = [] }: CollaboratorListProps) {
  const handleRevoke = async (userId: string) => {
    // TODO: Implement revoke access API call
    toast.success('Access revoked');
  };

  if (collaborators.length === 0) {
    return <p className="text-sm text-muted-foreground">No collaborators yet</p>;
  }

  return (
    <div className="space-y-2">
      {collaborators.map((access) => (
        <div
          key={access.user_id}
          className="flex items-center justify-between p-2 rounded-md hover:bg-muted"
        >
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback>{access.user_id[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{access.user_id}</p>
              <Badge variant="outline" className="text-xs">
                {access.permission_level}
              </Badge>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleRevoke(access.user_id)}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Revoke access</span>
          </Button>
        </div>
      ))}
    </div>
  );
}

