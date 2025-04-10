import Hero from '@/components/hero';
import MarkdownInput from '@/components/markdown-input';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background transition-colors duration-300">
      <main className="flex-1 container mx-auto px-4 py-8 md:py-16 max-w-5xl">
        <Hero />
        <MarkdownInput />
        {/*<NotesList />*/}
      </main>
    </div>
  );
}
