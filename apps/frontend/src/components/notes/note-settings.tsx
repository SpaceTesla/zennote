'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Visibility } from '@/types/note';

interface NoteSettingsProps {
  title: string;
  visibility: Visibility;
  onTitleChange: (title: string) => void;
  onVisibilityChange: (visibility: Visibility) => void;
  onDelete?: () => void;
  isEditable?: boolean;
  onEditableChange?: (value: boolean) => void;
  expiresAt?: string | null;
}

export function NoteSettings({
  title,
  visibility,
  onTitleChange,
  onVisibilityChange,
  onDelete,
  isEditable,
  onEditableChange,
  expiresAt,
}: NoteSettingsProps) {
  const getExpirationInfo = () => {
    if (!expiresAt) return null;
    const expires = new Date(expiresAt);
    const now = new Date();
    const daysLeft = Math.ceil((expires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysLeft > 0 ? `Expires in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}` : 'Expired';
  };

  const expirationInfo = getExpirationInfo();

  return (
    <Dialog>
      <DialogTrigger render={<Button variant="outline" size="sm"><Settings className="h-4 w-4 mr-2" />Settings</Button>} />
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

          <div className="space-y-2">
            <Label>Visibility</Label>
            <Select value={visibility} onValueChange={(v: Visibility) => onVisibilityChange(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select visibility" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="private">Private</SelectItem>
                <SelectItem value="unlisted">Unlisted</SelectItem>
                <SelectItem value="public">Public</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {onEditableChange !== undefined && (
            <div className="space-y-1 text-sm text-muted-foreground">
              <Label>Editing</Label>
              <p>{isEditable ? 'Editable' : 'Read-only'}</p>
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
              <AlertDialogTrigger render={<Button variant="destructive" className="w-full"><Trash2 className="h-4 w-4 mr-2" />Delete Note</Button>} />
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
