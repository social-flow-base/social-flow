import { Wallet, ConnectWallet } from "@coinbase/onchainkit/wallet";

export function LoginRequiredState() {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-200 bg-zinc-50/50 p-8 text-center dark:border-zinc-800 dark:bg-zinc-900/50">
      <div className="mb-6 rounded-full bg-blue-50 p-4 dark:bg-blue-900/20">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="h-8 w-8 text-blue-600 dark:text-blue-400"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
          />
        </svg>
      </div>
      <h3 className="mb-2 text-xl font-semibold text-zinc-900 dark:text-white">
        Connect Wallet Required
      </h3>
      <p className="mb-8 max-w-sm text-zinc-500 dark:text-zinc-400">
        You need to connect your wallet to view your transaction history, check
        your balance, and track your spending.
      </p>
      <Wallet>
        <ConnectWallet className="inline-flex items-center justify-center gap-3 rounded-xl bg-blue-600 px-8 py-3.5 text-sm font-semibold text-white transition-all hover:bg-blue-700 active:scale-[0.98]" />
      </Wallet>
    </div>
  );
}
