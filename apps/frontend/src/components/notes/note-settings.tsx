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
  slug?: string;
  onTitleChange: (title: string) => void;
  onVisibilityChange: (visibility: Visibility) => void;
  onSlugChange?: (slug: string) => void;
  onDelete?: () => void;
  isEditable?: boolean;
  onEditableChange?: (value: boolean) => void;
  expiresAt?: string | null;
}

export function NoteSettings({
  title,
  visibility,
  slug = '',
  onTitleChange,
  onVisibilityChange,
  onSlugChange,
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
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select visibility" />
              </SelectTrigger>
              <SelectContent 
                position="popper"
              >
                <SelectItem value="private">Private - Only you and collaborators</SelectItem>
                <SelectItem value="unlisted">Unlisted - Anyone with link</SelectItem>
                <SelectItem value="public">Public - Discoverable by everyone</SelectItem>
              </SelectContent>
            </Select>
            {visibility === 'public' && (
              <p className="text-xs text-muted-foreground">
                Public notes can be discovered and shared with a custom URL
              </p>
            )}
            {visibility === 'unlisted' && (
              <p className="text-xs text-muted-foreground">
                Unlisted notes are accessible via direct link but won't appear in public listings
              </p>
            )}
            {visibility === 'private' && (
              <p className="text-xs text-muted-foreground">
                Private notes are only visible to you and people you share with
              </p>
            )}
          </div>

          {visibility === 'public' && onSlugChange && (
            <div className="space-y-2">
              <Label htmlFor="slug">Custom URL Slug (Optional)</Label>
              <Input
                id="slug"
                value={slug}
                onChange={(e) => {
                  // Only allow lowercase letters, numbers, and hyphens
                  let value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
                  // Remove leading and trailing hyphens
                  value = value.replace(/^-+|-+$/g, '');
                  onSlugChange(value);
                }}
                placeholder="my-awesome-note"
                pattern="[a-z0-9]([a-z0-9-]*[a-z0-9])?"
                maxLength={100}
              />
              <p className="text-xs text-muted-foreground">
                Create a custom URL like /u/username/{slug || 'my-awesome-note'}. 
                Only lowercase letters, numbers, and hyphens allowed (3-100 characters).
              </p>
            </div>
          )}

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
