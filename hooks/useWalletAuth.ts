import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { supabase } from "@/supabase/client";
import { User } from "@supabase/supabase-js";

export function useWalletAuth() {
  const { address, isConnected } = useAccount();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function handleWalletAuth() {
      if (!address || !isConnected) {
        setUser(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        // 1. Check if user exists in profiles table by wallet_address
        const { data: existingProfile, error: fetchError } = await supabase
          .from("profiles")
          .select("id, wallet_address")
          .eq("wallet_address", address)
          .maybeSingle();

        if (fetchError) throw fetchError;

        let userId = existingProfile?.id;

        // 2. If not found, insert new profile
        if (!userId) {
          console.log("User not found, creating new profile for:", address);
          // Manually generate UUID since database column might not have default gen_random_uuid()
          const newId = crypto.randomUUID();

          const { data: newProfile, error: insertError } = await supabase
            .from("profiles")
            .insert([
              {
                id: newId,
                wallet_address: address,
                chain_id: "eip155:84532", // Base Sepolia
                updated_at: new Date().toISOString(),
              },
            ])
            .select("id")
            .single();

          if (insertError) throw insertError;
          userId = newProfile.id;
        }

        // 3. Set User State - mimicking Supabase User object structure minimally
        setUser({ id: userId } as User);
      } catch (err: any) {
        console.error("Wallet auth failed:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    handleWalletAuth();
  }, [address, isConnected]);

  return {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    userId: user?.id,
  };
}
