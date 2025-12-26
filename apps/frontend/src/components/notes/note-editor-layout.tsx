'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { MarkdownEditor } from './markdown-editor';
import { MarkdownPreview } from './markdown-preview';
import { useMediaQuery } from '@/lib/hooks/use-media-query';
import { Separator } from '@/components/ui/separator';
import { Maximize2, Minimize2 } from 'lucide-react';

interface NoteEditorLayoutProps {
  content: string;
  onContentChange: (content: string) => void;
  onSave?: () => void;
  onCancel?: () => void;
  isLoading?: boolean;
  className?: string;
}

export function NoteEditorLayout({
  content,
  onContentChange,
  onSave,
  onCancel,
  isLoading,
  className,
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
      <div className={`flex flex-col h-full ${className}`}>
        <Tabs defaultValue="edit" className="flex-1 flex flex-col">
          <div className="flex items-center justify-between border-b px-4 py-2">
            <TabsList>
              <TabsTrigger value="edit">Edit</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>
            <div className="flex gap-2">
              {onCancel && (
                <Button variant="outline" onClick={onCancel} disabled={isLoading}>
                  Cancel
                </Button>
              )}
              {onSave && (
                <Button onClick={onSave} disabled={isLoading}>
                  Save
                </Button>
              )}
            </div>
          </div>
          <TabsContent value="edit" className="flex-1 m-0">
            <MarkdownEditor
              value={content}
              onChange={onContentChange}
              className="h-full"
            />
          </TabsContent>
          <TabsContent value="preview" className="flex-1 m-0">
            <MarkdownPreview content={content} className="h-full" />
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col h-full ${
        isFullscreen ? 'fixed inset-0 z-50 bg-background' : className
      }`}
    >
      <div className="flex items-center justify-between border-b px-4 py-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsFullscreen(!isFullscreen)}
          aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
        >
          {isFullscreen ? (
            <Minimize2 className="h-4 w-4" />
          ) : (
            <Maximize2 className="h-4 w-4" />
          )}
        </Button>
        <div className="flex gap-2">
          {onCancel && (
            <Button variant="outline" onClick={onCancel} disabled={isLoading}>
              Cancel
            </Button>
          )}
          {onSave && (
            <Button onClick={onSave} disabled={isLoading}>
              Save
            </Button>
          )}
        </div>
      </div>
      <div className="flex flex-1 overflow-hidden">
        <div
          className="flex-1 border-r"
          style={{ width: `${splitRatio}%` }}
        >
          <MarkdownEditor
            value={content}
            onChange={onContentChange}
            className="h-full"
          />
        </div>
        <div
          className="relative cursor-col-resize group"
          onMouseDown={(e) => {
            const startX = e.clientX;
            const startRatio = splitRatio;

            const handleMouseMove = (moveEvent: MouseEvent) => {
              const deltaX = moveEvent.clientX - startX;
              const containerWidth = window.innerWidth;
              const deltaPercent = (deltaX / containerWidth) * 100;
              const newRatio = Math.max(10, Math.min(90, startRatio + deltaPercent));
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
          <Separator orientation="vertical" className="h-full w-1 group-hover:bg-primary transition-colors" />
        </div>
        <div
          className="flex-1"
          style={{ width: `${100 - splitRatio}%` }}
        >
          <MarkdownPreview content={content} className="h-full" />
        </div>
      </div>
    </div>
  );
}

