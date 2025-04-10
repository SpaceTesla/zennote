export default function Footer() {
  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800 py-6">
      <div className="container mx-auto px-4 text-center text-sm text-zinc-500 dark:text-zinc-500 max-w-5xl">
        <p>© {new Date().getFullYear()} Zennote. Designed with tranquility in mind.</p>
      </div>
    </footer>
  )
}

