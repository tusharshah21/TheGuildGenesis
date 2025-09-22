import React, { useMemo } from "react";
import { useAccount } from "wagmi";
import { formatUnits } from "viem";
import useGetActivityTokenBalance from "@/hooks/attestations/use-get-activity-token-balance";

export function ActivityTokenBalance() {
  const { address, isConnected } = useAccount();
  const { data, isLoading } = useGetActivityTokenBalance(
    address as `0x${string}` | undefined
  );

  const formatted = useMemo(() => {
    if (!data) return undefined;
    return formatUnits(data.raw, data.decimals);
  }, [data]);

  if (!isConnected) return null;

  return (
    <div className="text-sm text-gray-700">
      {isLoading ? "…" : (formatted ?? "0")} TGA
    </div>
  );
}

export default ActivityTokenBalance;
