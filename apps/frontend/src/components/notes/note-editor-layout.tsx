'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MarkdownEditor } from './markdown-editor';
import { MarkdownPreview } from './markdown-preview';
import { useMediaQuery } from '@/lib/hooks/use-media-query';
import { Separator } from '@/components/ui/separator';
import { Maximize2, Minimize2 } from '@/components/ui/hugeicons';

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
}: NoteEditorLayoutProps) {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [splitRatio, setSplitRatio] = useState(50);

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
        <Tabs defaultValue="edit" className="flex-1 flex flex-col min-h-0">
          {title !== undefined && onTitleChange && (
            <div className="border-b px-4 py-2 flex-shrink-0">
              <Input
                type="text"
                placeholder={titlePlaceholder}
                value={title}
                onChange={(e) => onTitleChange(e.target.value)}
                className="w-full text-sm font-semibold"
              />
            </div>
          )}
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
      <div className="flex items-center gap-3 border-b px-4 py-2 flex-shrink-0">
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
        {title !== undefined && onTitleChange && (
          <Input
            type="text"
            placeholder={titlePlaceholder}
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            className="flex-1 text-sm font-semibold border-0 shadow-none focus-visible:ring-0 bg-transparent"
          />
        )}
        <div className="flex gap-2 ml-auto">
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
          className="relative cursor-col-resize group flex-shrink-0"
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
          <Separator
            orientation="vertical"
            className="h-full w-1 group-hover:bg-primary transition-colors"
          />
        </div>
        <div
          className="flex-1 min-h-0"
          style={{ width: `${100 - splitRatio}%` }}
        >
          <MarkdownPreview content={content} className="h-full" />
        </div>
      </div>
    </div>
  );
}
