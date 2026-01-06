'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MarkdownEditor } from './markdown-editor';
import { MarkdownPreview } from './markdown-preview';
import { useMediaQuery } from '@/lib/hooks/use-media-query';
import { Maximize2, Minimize2 } from '@/components/ui/hugeicons';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Visibility } from '@/types/note';

interface NoteEditorLayoutProps {
  content: string;
  onContentChange: (content: string) => void;
  onSave?: () => void;
  onCancel?: () => void;
  isLoading?: boolean;
  className?: string;
  title?: string;
  onTitleChange?: (title: string) => void;
  titlePlaceholder?: string;
  visibility?: Visibility;
  onVisibilityChange?: (visibility: Visibility) => void;
  slug?: string;
  onSlugChange?: (slug: string) => void;
}

export function NoteEditorLayout({
  content,
  onContentChange,
  onSave,
  onCancel,
  isLoading,
  className,
  title,
  onTitleChange,
  titlePlaceholder = 'Enter note title...',
  visibility,
  onVisibilityChange,
  slug,
  onSlugChange,
}: NoteEditorLayoutProps) {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [splitRatio, setSplitRatio] = useState(50);

  const renderVisibilityControls = () => {
    if (visibility === undefined || !onVisibilityChange) return null;

    return (
      <div className="flex flex-wrap items-center gap-3">
        {visibility === 'public' && slug !== undefined && onSlugChange && (
          <Input
            type="text"
            placeholder="slug (optional)"
            value={slug}
            onChange={(e) => {
              const input = e.target.value.toLowerCase();
              // Match only allowed characters (letters, numbers, hyphens)
              const allowed = input.match(/[a-z0-9-]/g);
              const value = allowed ? allowed.join('') : '';
              onSlugChange(value);
            }}
            onBlur={(e) => {
              // Remove leading and trailing hyphens only on blur
              const value = e.target.value.replace(/^-+|-+$/g, '');
              onSlugChange(value);
            }}
            className="w-[180px] text-sm bg-transparent text-foreground"
            maxLength={100}
          />
        )}
        <Select
          value={visibility}
          onValueChange={(v: Visibility) => onVisibilityChange(v)}
        >
          <SelectTrigger className="w-[160px] text-sm bg-transparent">
            <SelectValue>
              {(value) => {
                if (value === 'private') return 'Private';
                if (value === 'unlisted') return 'Unlisted';
                if (value === 'public') return 'Public';
                return 'Unlisted';
              }}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="private">Private</SelectItem>
            <SelectItem value="unlisted">Unlisted</SelectItem>
            <SelectItem value="public">Public</SelectItem>
          </SelectContent>
        </Select>
      </div>
    );
  };

  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isFullscreen]);

  if (isMobile) {
    return (
      <div className={`flex flex-col h-full bg-background ${className}`}>
        <div className="px-4 pt-3 pb-3 space-y-3 border-b border-border/40">
          {title !== undefined && onTitleChange && (
            <Input
              type="text"
              placeholder={titlePlaceholder}
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              className="w-full border-0 px-0 text-3xl font-semibold tracking-tight shadow-none focus-visible:ring-0 bg-transparent placeholder:font-medium placeholder:text-muted-foreground/80 text-foreground"
            />
          )}
          {renderVisibilityControls()}
          <div className="flex items-center gap-2">
            {onCancel && (
              <Button
                variant="outline"
                size="sm"
                onClick={onCancel}
                disabled={isLoading}
              >
                Cancel
              </Button>
            )}
            {onSave && (
              <Button size="sm" onClick={onSave} disabled={isLoading}>
                Save
              </Button>
            )}
          </div>
        </div>
        <Tabs defaultValue="edit" className="flex-1 flex flex-col min-h-0">
          <div className="flex items-center justify-between border-b px-4 py-2 flex-shrink-0">
            <TabsList>
              <TabsTrigger value="edit">Edit</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>
            <div className="flex gap-2">
              {onCancel && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onCancel}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
              )}
              {onSave && (
                <Button size="sm" onClick={onSave} disabled={isLoading}>
                  Save
                </Button>
              )}
            </div>
          </div>
          <TabsContent value="edit" className="flex-1 m-0 min-h-0">
            <MarkdownEditor
              value={content}
              onChange={onContentChange}
              className="h-full"
            />
          </TabsContent>
          <TabsContent value="preview" className="flex-1 m-0 min-h-0">
            <MarkdownPreview content={content} className="h-full" />
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col bg-background ${
        isFullscreen
          ? 'fixed inset-0 z-50 h-screen'
          : `flex-1 min-h-0 ${className}`
      }`}
    >
      <div className="flex flex-wrap items-center gap-3 px-4 py-3 border-b border-border/40 bg-muted/20">
        {title !== undefined && onTitleChange && (
          <Input
            type="text"
            placeholder={titlePlaceholder}
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            className="flex-1 min-w-[240px] border-0 px-0 text-3xl font-semibold tracking-tight shadow-none focus-visible:ring-0 bg-transparent placeholder:font-medium placeholder:text-muted-foreground/80 text-foreground"
          />
        )}
        {renderVisibilityControls()}
        <div className="flex items-center gap-2 ml-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsFullscreen(!isFullscreen)}
            aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            className="flex-shrink-0"
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </Button>
          {onCancel && (
            <Button
              variant="outline"
              size="sm"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
          )}
          {onSave && (
            <Button size="sm" onClick={onSave} disabled={isLoading}>
              Save
            </Button>
          )}
        </div>
      </div>
      <div className="flex flex-1 overflow-hidden min-h-0">
        <div
          className="flex-1 border-r min-h-0"
          style={{ width: `${splitRatio}%` }}
        >
          <MarkdownEditor
            value={content}
            onChange={onContentChange}
            className="h-full"
          />
        </div>
        <div
          className="relative cursor-col-resize group flex-shrink-0 w-4 select-none"
          onMouseDown={(e) => {
            const startX = e.clientX;
            const startRatio = splitRatio;

            const handleMouseMove = (moveEvent: MouseEvent) => {
              const deltaX = moveEvent.clientX - startX;
              const containerWidth = window.innerWidth;
              const deltaPercent = (deltaX / containerWidth) * 100;
              const newRatio = Math.max(
                10,
                Math.min(90, startRatio + deltaPercent)
              );
              setSplitRatio(newRatio);
            };

            const handleMouseUp = () => {
              document.removeEventListener('mousemove', handleMouseMove);
              document.removeEventListener('mouseup', handleMouseUp);
            };

            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
          }}
        >
          <div className="absolute inset-0" />
          <div className="absolute inset-y-0 left-1/2 w-[2px] -translate-x-1/2 bg-border/60 group-hover:bg-primary transition-colors" />
        </div>
        <div
          className="flex-1 min-h-0"
          style={{ width: `${100 - splitRatio}%` }}
        >
          <div className="h-full overflow-y-auto bg-muted/10">
            <div className="max-w-3xl mx-auto">
              <MarkdownPreview content={content} className="h-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
