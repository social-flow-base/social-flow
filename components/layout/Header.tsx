"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserAuthProfile } from "@/components/user-auth-profile";
import { useRef } from "react";
import Image from "next/image";

export function Header() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  const navLinks = [
    { href: "/", label: "Generator" },
    { href: "/posts", label: "Posts" },
    { href: "/transactions", label: "Transactions" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-black">
      <div className="max-w-7xl px-5 xl:px-0 mx-auto flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Image src="/logo.png" alt="Logo" width={32} height={32} />
        </div>

        <div className="flex items-center gap-8">
          <UserAuthProfile />
        </div>
      </div>
    </header>
  );
}
