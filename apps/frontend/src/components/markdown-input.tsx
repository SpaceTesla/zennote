'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles } from '@/components/ui/hugeicons';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { config } from '@/config';

export default function MarkdownInput() {
  const router = useRouter();
  const [markdown, setMarkdown] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleBeautify = async () => {
    if (!markdown.trim()) return;

    setIsGenerating(true);

    try {
      // Send markdown to backend API
      const response = await fetch(
        `${config.api.baseUrl}${config.api.endpoints.notes}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: `Note ${new Date().toLocaleString()}`, // Generate a default title
            content: markdown,
          }),
        },
      );

      if (!response.ok) {
        throw new Error('Failed to save note');
      }

      const data = await response.json();

      // Handle successful save
      toast(`Your note has been saved with ID: ${data.id}`);
      router.push(`/notes/${data.id}`);

      console.log('Saved note:', data);
    } catch (error) {
      console.error('Error saving note:', error);
      toast.error('Failed to save your note. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="mt-8 md:mt-12">
      <div className="relative">
        <textarea
          value={markdown}
          onChange={(e) => setMarkdown(e.target.value)}
          placeholder="Paste your markdown here..."
          className="w-full h-64 p-6 rounded-xl bg-background/50
                        border border-zinc-200 dark:border-zinc-700
                        shadow-inner text-zinc-800 dark:text-zinc-200
                        focus:outline-none focus:ring-2 focus:ring-emerald-500/50
                        resize-none font-mono text-sm
                        transition-all duration-200"
        />
        <div className="neumorphic-pressed absolute inset-0 -z-10 rounded-xl"></div>
      </div>

      <div className="mt-6 flex justify-center">
        <Button
          onClick={handleBeautify}
          disabled={!markdown.trim() || isGenerating}
          className="px-6 py-6 text-lg rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white
                        shadow-lg hover:shadow-emerald-500/25 transition-all duration-300
                        disabled:opacity-70 disabled:cursor-not-allowed"
        >
          <Sparkles className="mr-2 h-5 w-5" />
          {isGenerating ? 'Saving...' : 'Beautify & Save'}
        </Button>
      </div>
    </div>
  );
}
