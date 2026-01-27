"use client";

import { useState, useEffect } from "react";
import { useAccount, useDisconnect, useConnect } from "wagmi";
import { supabase } from "@/supabase/client";
import { User } from "@supabase/supabase-js";
import { TopUpModal } from "./TopUpModal";
import { useWalletAuth } from "@/hooks/useWalletAuth";

export function UserAuthProfile() {
  const { disconnect } = useDisconnect();
  const { connect, connectors } = useConnect();

  const { user, loading, error } = useWalletAuth();
  const address = user?.id; // This is actually userId, but profileData logic below uses user.id which is correct.
  // Wait, the original code used `address` from useAccount for display or logic?
  // Line 10: const { address, isConnected } = useAccount();
  // We still need wagmi hooks for connect/disconnect UI.

  const { address: walletAddress, isConnected } = useAccount();

  const [profileData, setProfileData] = useState<{
    credits: number;
  } | null>(null);

  const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false);

  // We rely on useWalletAuth for user creation/fetching.
  // We just need to fetch credits when user is available.

  // Fetch credits when user is set
  useEffect(() => {
    async function fetchCredits() {
      if (!user) return;
      try {
        const { data: creditsData, error } = await supabase
          .from("user_credits")
          .select("credits_remaining")
          .eq("user_id", user.id)
          .maybeSingle();

        if (error) {
          console.warn("No credits found for user", error);
        }

        setProfileData({
          credits: creditsData?.credits_remaining || 0,
        });
      } catch (err) {
        console.error("Failed to fetch credits:", err);
      }
    }

    fetchCredits();

    const handleCreditsUpdate = () => {
      fetchCredits();
    };

    window.addEventListener("creditsUpdated", handleCreditsUpdate);
    return () =>
      window.removeEventListener("creditsUpdated", handleCreditsUpdate);
  }, [user]);

  const handleLogout = async () => {
    if (isConnected) {
      disconnect();
    }
    // Optional: Clear any local session state if we added any manually,
    // but since we rely on `useAccount`, simply disconnecting should suffice to trigger the useEffects.
    // setUser(null); // Managed by hook now, or just reload page fixes it
    // setProfileData(null);

    // We might not even need the API call if it was just for clearing cookies
    try {
      await fetch("/api/auth/disconnect", {
        method: "POST",
        body: JSON.stringify({ platform: "all" }),
      });
    } catch (e) {
      console.error(e);
    }

    window.location.reload();
  };

  if (loading) {
    return (
      <div className="h-10 w-32 animate-pulse rounded-full bg-zinc-100 dark:bg-zinc-800" />
    );
  }

  if (!isConnected) {
    return (
      <button
        onClick={() => connect({ connector: connectors[0] })}
        className="rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 active:scale-[0.98] dark:bg-blue-500 dark:hover:bg-blue-600"
      >
        Connect Wallet
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {/* Wallet Address Display */}

      {/* Top Up Button */}
      <div className="flex items-center rounded-full border border-zinc-200 bg-white p-1 pr-1 dark:border-zinc-800 dark:bg-zinc-900">
        <span className="px-3 text-xs font-medium text-zinc-600 dark:text-zinc-400">
          {profileData?.credits ?? 0} Credits
        </span>
        <button
          onClick={() => setIsTopUpModalOpen(true)}
          className="flex h-7 items-center gap-1 rounded-full bg-blue-600 px-3 text-[10px] font-bold text-white transition-transform active:scale-95 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
          TOP UP
        </button>
      </div>

      {/* Standalone Logout Button */}
      <button
        onClick={handleLogout}
        className="hidden md:flex h-10 w-10 items-center justify-center rounded-full border border-transparent text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:text-zinc-500 dark:hover:bg-red-900/20 dark:hover:text-red-400"
        title="Logout"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4"
        >
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
      </button>

      <TopUpModal
        isOpen={isTopUpModalOpen}
        onClose={() => setIsTopUpModalOpen(false)}
        userId={user?.id}
        onSuccess={() => {
          const event = new CustomEvent("creditsUpdated");
          window.dispatchEvent(event);
        }}
      />
    </div>
  );
}
