'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Settings, Trash2 } from '@/components/ui/hugeicons';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface NoteSettingsProps {
  title: string;
  isPublic: boolean;
  onTitleChange: (title: string) => void;
  onPublicChange: (isPublic: boolean) => void;
  onDelete?: () => void;
  isPermanent?: boolean;
  expiresAt?: string | null;
}

export function NoteSettings({
  title,
  isPublic,
  onTitleChange,
  onPublicChange,
  onDelete,
  isPermanent,
  expiresAt,
}: NoteSettingsProps) {
  const getExpirationInfo = () => {
    if (isPermanent || !expiresAt) return null;
    const expires = new Date(expiresAt);
    const now = new Date();
    const daysLeft = Math.ceil((expires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysLeft > 0 ? `Expires in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}` : 'Expired';
  };

  const expirationInfo = getExpirationInfo();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Note Settings</DialogTitle>
          <DialogDescription>Manage your note's visibility and details</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder="Note title"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="public">Public</Label>
              <p className="text-sm text-muted-foreground">
                Anyone with the link can view this note
              </p>
            </div>
            <Switch
              id="public"
              checked={isPublic}
              onCheckedChange={onPublicChange}
            />
          </div>

          {isPermanent && (
            <div className="rounded-md bg-muted p-3">
              <p className="text-sm font-medium">Permanent Note</p>
              <p className="text-xs text-muted-foreground">
                This note will never expire
              </p>
            </div>
          )}

          {expirationInfo && (
            <div className="rounded-md bg-yellow-500/10 p-3 border border-yellow-500/20">
              <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                {expirationInfo}
              </p>
            </div>
          )}

          {onDelete && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Note
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your note.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={onDelete}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

