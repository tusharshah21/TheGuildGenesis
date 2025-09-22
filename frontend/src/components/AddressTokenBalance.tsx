import React, { useMemo } from "react";
import { Coins, HelpCircle } from "lucide-react";
import { formatUnits } from "viem";
import useGetActivityTokenBalance from "@/hooks/attestations/use-get-activity-token-balance";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function AddressTokenBalance({ address }: { address: `0x${string}` }) {
  const balanceQuery = useGetActivityTokenBalance(address);

  const formatted = useMemo(() => {
    const raw = balanceQuery.data?.raw;
    const decimals = balanceQuery.data?.decimals ?? 18;
    if (raw === undefined) return undefined;
    return formatUnits(raw, decimals);
  }, [balanceQuery.data]);

  return (
    <div className="mt-1 flex items-center gap-2 text-xs text-gray-600">
      <Coins className="h-3 w-3" />
      <span>{balanceQuery.isLoading ? "…" : (formatted ?? "0")} TGA</span>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button aria-label="What is TGA?" className="cursor-help">
              <HelpCircle className="h-3.5 w-3.5 text-gray-500" />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>The Guild Attestation token rewards activity on the DApp.</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}

export default AddressTokenBalance;
