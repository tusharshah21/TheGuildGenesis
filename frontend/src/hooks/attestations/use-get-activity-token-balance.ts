import { useMemo } from "react";
import { useReadContract } from "wagmi";
import { erc20Abi } from "@/lib/abis/erc20Abi";
import { ACTIVITY_TOKEN_ADDRESS } from "@/lib/constants/blockchainConstants";

export function useGetActivityTokenBalance(address?: `0x${string}`) {
  const token = ACTIVITY_TOKEN_ADDRESS;

  const balanceQuery = useReadContract({
    abi: erc20Abi,
    address: token,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: Boolean(token && address) },
  });

  const decimalsQuery = useReadContract({
    abi: erc20Abi,
    address: token,
    functionName: "decimals",
    query: { enabled: Boolean(token) },
  });

  const value = useMemo(() => {
    const raw = balanceQuery.data as bigint | undefined;
    const decimals = Number((decimalsQuery.data as number | undefined) ?? 18);
    if (raw === undefined) return undefined;
    return { raw, decimals };
  }, [balanceQuery.data, decimalsQuery.data]);

  const isLoading = balanceQuery.isLoading || decimalsQuery.isLoading;
  const error =
    (balanceQuery.error as Error | null) ||
    (decimalsQuery.error as Error | null) ||
    null;

  return { data: value, isLoading, error, refetch: balanceQuery.refetch };
}

export default useGetActivityTokenBalance;
