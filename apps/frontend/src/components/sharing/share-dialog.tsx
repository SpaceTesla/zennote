'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { PermissionSelector } from './permission-selector';
import { CollaboratorList } from './collaborator-list';
import { PermissionLevel } from '@/types/note';
import { Share2 } from '@/components/ui/hugeicons';
import { toast } from 'sonner';
import { useShareNote } from '@/lib/queries/notes.queries';
import { profilesApi } from '@/lib/api/profiles';

interface ShareDialogProps {
  noteId: string;
  onShare?: () => void;
}

export function ShareDialog({ noteId, onShare }: ShareDialogProps) {
  const [open, setOpen] = useState(false);
  const [usernameOrId, setUsernameOrId] = useState('');
  const [permission, setPermission] = useState<PermissionLevel>('read');
  const shareNoteMutation = useShareNote();

  const handleShare = async () => {
    const target = usernameOrId.trim();
    if (!target) {
      toast.error('Please enter a username or user ID');
      return;
    }

    try {
      // Resolve username or ID to profile to get the user UUID
      const profile = await profilesApi.getProfile(target);
      if (!profile?.user_id) {
        toast.error('User not found');
        return;
      }

      await shareNoteMutation.mutateAsync({
        id: noteId,
        data: {
          user_id: profile.user_id,
          permission_level: permission,
        },
      });

      toast.success('Note shared successfully');
      setUsernameOrId('');
      onShare?.();
    } catch (error: any) {
      toast.error(error.message || 'Failed to share note');
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm"><Share2 className="h-4 w-4 mr-2" />Share</Button>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share Note</DialogTitle>
          <DialogDescription>
            Share this note with others by entering their username or user ID
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username or User ID</Label>
            <Input
              id="username"
              type="text"
              placeholder="username"
              value={usernameOrId}
              onChange={(e) => setUsernameOrId(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="permission">Permission Level</Label>
            <PermissionSelector value={permission} onChange={setPermission} />
          </div>
          <Button 
            onClick={handleShare} 
            className="w-full"
            disabled={shareNoteMutation.isPending}
          >
            {shareNoteMutation.isPending ? 'Granting...' : 'Grant Access'}
          </Button>
          <div className="border-t pt-4">
            <h3 className="font-semibold mb-2">Collaborators</h3>
            <CollaboratorList noteId={noteId} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
