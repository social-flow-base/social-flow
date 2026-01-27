"use client";

import { useAccount } from "wagmi";
import { useEffect, useRef } from "react";

export function WalletWatcher() {
  const { isConnected } = useAccount();
  const wasConnected = useRef(false);

  useEffect(() => {
    // If we have a wallet, we are connected
    if (isConnected) {
      wasConnected.current = true;
    }
    // If we don't have a wallet, but we WERE connected previously, that means we just disconnected
    else if (!isConnected && wasConnected.current) {
      // Trigger global disconnect
      fetch("/api/auth/disconnect", {
        method: "POST",
        body: JSON.stringify({ platform: "all" }),
      })
        .then(() => {
          // Refresh page to update UI state
          window.location.reload();
        })
        .catch((err) => {
          console.error("Failed to disconnect platforms", err);
        });

      wasConnected.current = false;
    }
  }, [isConnected]);

  return null;
}
