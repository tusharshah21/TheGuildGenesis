import { useMemo } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import type { Address } from "viem";
import { badgeRegistryAbi } from "@/lib/abis/badgeRegistryAbi";

const BADGE_REGISTRY_ADDRESS = (import.meta.env.PUBLIC_BADGE_REGISTRY_ADDRESS ||
  "") as Address;

function stringToBytes32(value: string): `0x${string}` {
  // Encode to utf8, pad/truncate to 32 bytes, return as hex
  const encoder = new TextEncoder();
  const bytes = encoder.encode(value);
  const out = new Uint8Array(32);
  const len = Math.min(32, bytes.length);
  for (let i = 0; i < len; i++) out[i] = bytes[i];
  // Convert to hex
  let hex = "0x";
  for (let i = 0; i < out.length; i++) {
    const h = out[i].toString(16).padStart(2, "0");
    hex += h;
  }
  return hex as `0x${string}`;
}

export function useCreateBadge() {
  const { writeContractAsync, isPending, error, data, reset } =
    useWriteContract();

  const createBadge = useMemo(() => {
    return async (name: string, description: string) => {
      if (!BADGE_REGISTRY_ADDRESS) throw new Error("Missing registry address");
      const nameBytes = stringToBytes32(name);
      const descriptionBytes = stringToBytes32(description);
      return writeContractAsync({
        abi: badgeRegistryAbi,
        address: BADGE_REGISTRY_ADDRESS,
        functionName: "createBadge",
        args: [nameBytes, descriptionBytes],
      });
    };
  }, [writeContractAsync]);

  const wait = useWaitForTransactionReceipt({
    hash: data as `0x${string}` | undefined,
    confirmations: 6,
    query: { enabled: Boolean(data) },
  });

  return {
    createBadge,
    isPending,
    error,
    data,
    isConfirming: wait.isLoading,
    isConfirmed: wait.isSuccess,
    receipt: wait.data,
    waitError: wait.error as Error | null,
    reset,
  };
}
