"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserAuthProfile } from "@/components/user-auth-profile";

export function Header() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-black">
      <div className="max-w-7xl px-5 xl:px-0 mx-auto flex h-16 items-center justify-between">
        <div className="flex items-center gap-2"></div>

        <div className="flex items-center gap-8">
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/generator"
              className={`text-sm font-medium transition-colors ${
                isActive("/generator")
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
              }`}
            >
              Generator
            </Link>
            <Link
              href="/posts"
              className={`text-sm font-medium transition-colors ${
                isActive("/posts")
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
              }`}
            >
              Posts
            </Link>
            {/* <Link
              href="/saved"
              className={`text-sm font-medium transition-colors ${
                isActive("/saved")
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
              }`}
            >
              Saved
            </Link> */}
            <Link
              href="/transactions"
              className={`text-sm font-medium transition-colors ${
                isActive("/transactions")
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
              }`}
            >
              Transactions
            </Link>
          </nav>

          <UserAuthProfile />
        </div>
      </div>
    </header>
  );
}
