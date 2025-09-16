import { useMemo } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { BADGE_REGISTRY_ADDRESS } from "@/lib/constants/blockchainConstants";
import { badgeRegistryAbi } from "@/lib/abis/badgeRegistryAbi";
import { stringToBytes32 } from "@/lib/utils/blockchainUtils";

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
