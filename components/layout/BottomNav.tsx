"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, FileText, ArrowRightLeft } from "lucide-react";

export function BottomNav() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  const navLinks = [
    {
      href: "/",
      label: "Generator",
      icon: <Sparkles className="h-6 w-6" />,
    },
    {
      href: "/posts",
      label: "Posts",
      icon: <FileText className="h-6 w-6" />,
    },
    {
      href: "/transactions",
      label: "Transactions",
      icon: <ArrowRightLeft className="h-6 w-6" />,
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 block border-t border-zinc-200 bg-white/80 pb-safe backdrop-blur-lg dark:border-zinc-800 dark:bg-black/80 md:hidden">
      <nav className="flex h-16 items-center justify-around px-2">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`flex flex-col items-center justify-center gap-1 p-2 text-xs font-medium transition-colors ${
              isActive(link.href)
                ? "text-blue-600 dark:text-blue-400"
                : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
            }`}
          >
            {link.icon}
            <span>{link.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
