import { useAccount } from "wagmi";
import { readContract } from "wagmi/actions";
import { useConfig } from "wagmi";
import { IDRX_CONTRACT, ERC20_ABI, PRICING } from "@/lib/contracts/idrx";
import { useQuery } from "@tanstack/react-query";
import { formatUnits } from "viem";

export function useIDRXBalance() {
  const { address } = useAccount();
  const config = useConfig();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["idrx-balance", address, 84532],
    queryFn: async () => {
      if (!address) return BigInt(0);

      const balance = await readContract(config, {
        address: IDRX_CONTRACT.address,
        abi: ERC20_ABI,
        functionName: "balanceOf",
        args: [address],
      });
      return balance as bigint;
    },
    enabled: !!address, // Always enabled for demo
    refetchInterval: 2000, // Poll more frequently for demo
    staleTime: 0, // Always fetch fresh data
  });

  return {
    balance: data ?? BigInt(0),
    balanceFormatted: data ? formatUnits(data, IDRX_CONTRACT.decimals) : "0",
    isLoading,
    error,
    refetch,
  };
}

export function useIDRXAllowance() {
  const { address } = useAccount();
  const config = useConfig();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["idrx-allowance", address, 84532],
    queryFn: async () => {
      if (!address) return BigInt(0);
      const allowance = await readContract(config, {
        address: IDRX_CONTRACT.address,
        abi: ERC20_ABI,
        functionName: "allowance",
        args: [address, PRICING.SERVER_WALLET],
      });
      return allowance as bigint;
    },
    enabled: !!address, // Always enabled for demo
    refetchInterval: 2000, // Poll more frequently for demo
    staleTime: 0, // Always fetch fresh data
  });

  return {
    allowance: data ?? BigInt(0),
    allowanceFormatted: data ? formatUnits(data, IDRX_CONTRACT.decimals) : "0",
    isLoading,
    error,
    refetch,
  };
}

export function useCanAffordGeneration() {
  const { balance, isLoading: balanceLoading } = useIDRXBalance();
  const { allowance, isLoading: allowanceLoading } = useIDRXAllowance();

  const pricePerGen = BigInt(PRICING.PER_GENERATION);

  // DEMO MODE: Always allow generation
  return {
    canAfford: balance >= pricePerGen,
    hasAllowance: allowance >= pricePerGen,
    needsApproval: allowance < pricePerGen,
    balance,
    allowance,
    pricePerGen,
    isLoading: balanceLoading || allowanceLoading,
  };
}
