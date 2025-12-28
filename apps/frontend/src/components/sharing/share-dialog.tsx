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

interface ShareDialogProps {
  noteId: string;
  onShare?: () => void;
}

export function ShareDialog({ noteId, onShare }: ShareDialogProps) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [permission, setPermission] = useState<PermissionLevel>('read');

  const handleShare = async () => {
    if (!email.trim()) {
      toast.error('Please enter an email address');
      return;
    }

    // TODO: Implement share API call
    toast.success('Note shared successfully');
    setEmail('');
    setOpen(false);
    onShare?.();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm"><Share2 className="h-4 w-4 mr-2" />Share</Button>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share Note</DialogTitle>
          <DialogDescription>
            Share this note with others by entering their email address
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="permission">Permission Level</Label>
            <PermissionSelector value={permission} onChange={setPermission} />
          </div>
          <Button onClick={handleShare} className="w-full">
            Grant Access
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

