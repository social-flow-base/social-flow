"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { useAccount } from "wagmi";

interface CreditLog {
  id: string;
  created_at: string;
  action: string;
  credits_used: number;
}

export function CreditUsageTable() {
  const [logs, setLogs] = useState<CreditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { address } = useAccount();

  useEffect(() => {
    async function fetchLogs() {
      setIsLoading(true);
      try {
        if (!address) {
          setLogs([]);
          setIsLoading(false);
          return;
        }

        // 1. Get user_id from profiles table using wallet address
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("id")
          .eq("wallet_address", address)
          .single();

        if (profileError || !profileData) {
          console.warn("Profile not found for address:", address);
          setLogs([]);
          setIsLoading(false);
          return;
        }

        const userId = profileData.id;

        // 2. Fetch logs using the retrieved user_id
        const { data, error } = await supabase
          .from("credit_usage_logs")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setLogs(data || []);
      } catch (error) {
        console.error("Error fetching credit usage logs:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchLogs();
  }, [address]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
          Credit Usage History
        </h2>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden dark:border-zinc-800 dark:bg-black">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-left text-sm">
            <thead className="border-b border-zinc-100 bg-zinc-50/50 text-xs font-medium uppercase text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-400">
              <tr>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Action</th>
                <th className="px-6 py-4 text-right">Credits Used</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <tr
                    key={`skeleton-${index}`}
                    className="border-b border-zinc-50 dark:border-zinc-800"
                  >
                    <td className="px-6 py-4">
                      <Skeleton className="h-4 w-24" />
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton className="h-4 w-32" />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Skeleton className="ml-auto h-4 w-12" />
                    </td>
                  </tr>
                ))
              ) : logs.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="px-6 py-8 text-center text-zinc-500"
                  >
                    No credit usage found.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr
                    key={log.id}
                    className="group hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
                  >
                    <td className="px-6 py-4 text-zinc-600 dark:text-zinc-300">
                      {new Date(log.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-zinc-900 dark:text-zinc-100">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-zinc-900 dark:text-zinc-100">
                      {log.credits_used}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
