import ReactMarkdown from "react-markdown";

interface SavedContent {
  id: number;
  created_at: string;
  content: string;
  platform: string;
  prompt: string;
}

interface ContentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: SavedContent | null;
}

export function ContentDetailModal({
  isOpen,
  onClose,
  item,
}: ContentDetailModalProps) {
  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl bg-white shadow-xl ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 capitalize">
              {item.platform}
            </span>
            <span className="text-sm text-zinc-500 dark:text-zinc-400">
              {new Date(item.created_at).toLocaleString()}
            </span>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-5 w-5"
            >
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="mb-6">
            <h3 className="mb-2 text-sm font-medium text-zinc-900 dark:text-white">
              Prompt
            </h3>
            <div className="rounded-lg bg-zinc-50 p-4 text-sm text-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-300">
              {item.prompt}
            </div>
          </div>

          <div>
            <h3 className="mb-2 text-sm font-medium text-zinc-900 dark:text-white">
              Generated Content
            </h3>
            <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-black/50">
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown
                  components={{
                    p: ({ children }) => (
                      <p className="mb-4 last:mb-0 leading-relaxed">
                        {children}
                      </p>
                    ),
                    h1: ({ children }) => (
                      <h1 className="mb-4 text-xl font-bold">{children}</h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="mb-3 mt-6 text-lg font-bold">
                        {children}
                      </h2>
                    ),
                    ul: ({ children }) => (
                      <ul className="mb-4 list-disc pl-4 space-y-1">
                        {children}
                      </ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="mb-4 list-decimal pl-4 space-y-1">
                        {children}
                      </ol>
                    ),
                    li: ({ children }) => <li className="pl-1">{children}</li>,
                    strong: ({ children }) => (
                      <strong className="font-semibold">{children}</strong>
                    ),
                  }}
                >
                  {item.content}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t border-zinc-100 bg-zinc-50/50 px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900/50">
          <button
            onClick={onClose}
            className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-300 hover:bg-zinc-50 dark:bg-zinc-800 dark:text-white dark:ring-zinc-700 dark:hover:bg-zinc-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
