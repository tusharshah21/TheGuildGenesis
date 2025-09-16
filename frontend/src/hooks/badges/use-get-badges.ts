import { useMemo } from "react";
import { useReadContract, useReadContracts } from "wagmi";
import type { Address } from "viem";
import { badgeRegistryAbi } from "@/lib/abis/badgeRegistryAbi";

export type Badge = {
  name: string;
  description: string;
};

const BADGE_REGISTRY_ADDRESS = (import.meta.env.PUBLIC_BADGE_REGISTRY_ADDRESS ||
  "") as Address;

function bytes32ToString(value: `0x${string}`): string {
  try {
    // viem utils: to strip null bytes and decode
    const bytes = new TextDecoder();
    // fallback simple decode by removing trailing zeros and interpreting as utf8
    // Convert hex to Uint8Array
    const hex = value.startsWith("0x") ? value.slice(2) : value;
    const arr = new Uint8Array(hex.length / 2);
    for (let i = 0; i < arr.length; i++) {
      arr[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
    }
    // Trim trailing zeros
    let end = arr.length;
    while (end > 0 && arr[end - 1] === 0) end--;
    return bytes.decode(arr.subarray(0, end));
  } catch (_e) {
    return "";
  }
}

export function useGetBadges(): {
  data: Badge[] | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
} {
  const address = BADGE_REGISTRY_ADDRESS;

  const totalBadgesQuery = useReadContract({
    abi: badgeRegistryAbi,
    address,
    functionName: "totalBadges",
    query: {
      enabled: Boolean(address),
    },
  });

  const count = Number((totalBadgesQuery.data as bigint | undefined) ?? 0n);

  const badgeContracts = useMemo(
    () =>
      count > 0
        ? Array.from({ length: count }, (_, i) => ({
            abi: badgeRegistryAbi,
            address,
            functionName: "getBadgeAt" as const,
            args: [BigInt(i)],
          }))
        : [],
    [address, count]
  );

  const badgesQuery = useReadContracts({
    contracts: badgeContracts,
    allowFailure: false,
    query: {
      enabled: Boolean(address) && count > 0,
    },
  });

  const data: Badge[] | undefined = useMemo(() => {
    const results = badgesQuery.data as
      | [`0x${string}`, `0x${string}`, `0x${string}`][]
      | undefined;
    if (!results) return undefined;
    return results.map(([nameBytes, descriptionBytes]) => ({
      name: bytes32ToString(nameBytes),
      description: bytes32ToString(descriptionBytes),
    }));
  }, [badgesQuery.data]);

  const isLoading = totalBadgesQuery.isLoading || badgesQuery.isLoading;

  const error =
    (totalBadgesQuery.error as Error | null) ||
    (badgesQuery.error as Error | null) ||
    null;

  return { data, isLoading, error, refetch: totalBadgesQuery.refetch };
}
