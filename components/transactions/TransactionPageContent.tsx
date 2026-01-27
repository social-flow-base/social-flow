"use client";

import { StatsCards } from "@/components/transactions/StatsCards";
import { TransactionTable } from "@/components/transactions/TransactionTable";

export function TransactionPageContent() {
  return (
    <div className="space-y-8">
      <StatsCards />
      <TransactionTable />
    </div>
  );
}
