"use client";

import { supabase } from "@/supabase/client";
import { useEffect, useState } from "react";
import { StatsCards } from "@/components/transactions/StatsCards";
import { TransactionTable } from "@/components/transactions/TransactionTable";
import { LoginRequiredState } from "@/components/transactions/LoginRequiredState";

export function TransactionPageContent() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getSession() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    }
    getSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return <LoginRequiredState />;
  }

  return (
    <div className="space-y-8">
      <StatsCards />
      <TransactionTable />
    </div>
  );
}
