"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { supabase } from "@/utils/supabase/client";
import ReactMarkdown from "react-markdown";

interface SavedContent {
  id: number;
  created_at: string;
  content: string;
  platform: string;
  prompt: string;
}

import { AlertModal } from "@/components/ui/AlertModal";
import { ContentDetailModal } from "@/components/ui/ContentDetailModal";

export default function SavedContentPage() {
  const [savedItems, setSavedItems] = useState<SavedContent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPlatform, setFilterPlatform] = useState("all");

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Detail modal state
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<SavedContent | null>(null);

  const platforms = ["all", "linkedin", "instagram", "twitter", "threads"];

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSavedContent();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, filterPlatform]);

  const fetchSavedContent = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from("saved_content")
        .select("*")
        .order("created_at", { ascending: false });

      if (filterPlatform !== "all") {
        query = query.ilike("platform", filterPlatform);
      }

      if (searchQuery) {
        query = query.or(
          `prompt.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`,
        );
      }

      const { data, error } = await query;

      if (error) throw error;
      setSavedItems(data || []);
    } catch (error) {
      console.error("Error fetching saved content:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (id: number) => {
    setItemToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleShowDetail = (item: SavedContent) => {
    setSelectedItem(item);
    setDetailModalOpen(true);
  };

  const confirmDelete = async () => {
    if (itemToDelete === null) return;

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from("saved_content")
        .delete()
        .eq("id", itemToDelete);

      if (error) throw error;

      // Remove from local state
      setSavedItems((prev) => prev.filter((item) => item.id !== itemToDelete));
      setDeleteModalOpen(false);
      setItemToDelete(null);
    } catch (error) {
      console.error("Error deleting content:", error);
      alert("Failed to delete content");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-black">
      <Header />

      <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-7xl">
          <div className="mb-8 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
              Saved Content
            </h1>

            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              {/* Search Input */}
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="h-5 w-5 text-zinc-400"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search saved content..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-zinc-200 bg-white py-2 pl-10 pr-4 text-sm text-zinc-900 placeholder-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white dark:placeholder-zinc-400 md:w-64"
                />
              </div>

              {/* Platform Filter */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
                {platforms.map((platform) => (
                  <button
                    key={platform}
                    onClick={() => setFilterPlatform(platform)}
                    className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                      filterPlatform === platform
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
                        : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
                    }`}
                  >
                    {platform.charAt(0).toUpperCase() + platform.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center p-12">
              <svg
                className="h-8 w-8 animate-spin text-blue-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </div>
          ) : savedItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-200 bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-900">
              <div className="mb-4 rounded-full bg-zinc-100 p-4 dark:bg-zinc-800">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="h-8 w-8 text-zinc-400"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-zinc-900 dark:text-white">
                {savedItems.length === 0 &&
                !searchQuery &&
                filterPlatform === "all"
                  ? "No saved content yet"
                  : "No matches found"}
              </h3>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                {savedItems.length === 0 &&
                !searchQuery &&
                filterPlatform === "all"
                  ? "Generate and save content to see it here."
                  : "Try adjusting your search or filters."}
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {savedItems.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col rounded-xl border border-zinc-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                      {item.platform}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-zinc-500 dark:text-zinc-400">
                        {new Date(item.created_at).toLocaleDateString()}
                      </span>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="rounded-md p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
                        title="Delete"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          className="h-4 w-4"
                        >
                          <path
                            fillRule="evenodd"
                            d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h3 className="mb-1 text-sm font-medium text-zinc-900 dark:text-white">
                      Prompt:
                    </h3>
                    <p className="line-clamp-2 text-sm text-zinc-500 dark:text-zinc-400">
                      {item.prompt}
                    </p>
                  </div>

                  <div className="flex-1 rounded-lg bg-zinc-50 p-4 dark:bg-black/50">
                    <div className="line-clamp-6 text-sm text-zinc-600 dark:text-zinc-300">
                      <ReactMarkdown
                        components={{
                          p: ({ children }) => (
                            <p className="mb-2 last:mb-0">{children}</p>
                          ),
                        }}
                      >
                        {item.content}
                      </ReactMarkdown>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => handleShowDetail(item)}
                      className="text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      Show Detail
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <AlertModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Content"
        message="Are you sure you want to delete this saved content? This action cannot be undone."
        confirmLabel="Delete"
        isDestructive={true}
        isLoading={isDeleting}
      />

      <ContentDetailModal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        item={selectedItem}
      />

      <Footer />
    </div>
  );
}
