export function Footer() {
  return (
    <footer className="w-full border-t border-zinc-200 bg-zinc-50 py-8 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="container mx-auto flex flex-col items-center justify-between gap-4 text-sm text-zinc-500 sm:flex-row">
        <p>© {new Date().getFullYear()} Social Flow.</p>
      </div>
    </footer>
  );
}
