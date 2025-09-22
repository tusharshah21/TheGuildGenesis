import { User, Coins } from "lucide-react";
import { useAccount } from "wagmi";
import { useMemo } from "react";
import { useGetProfiles } from "@/hooks/profiles/use-get-profiles";
import { formatUnits } from "viem";
import useGetActivityTokenBalance from "@/hooks/attestations/use-get-activity-token-balance";

export function ProfileHeader({ address }: { address: string }) {
  const profilesQuery = useGetProfiles();

  const profile = useMemo(() => {
    const list = profilesQuery.data ?? [];
    const p = list.find(
      (x) => x.address.toLowerCase() === (address || "").toLowerCase()
    );
    return p;
  }, [profilesQuery.data, address]);

  const displayName =
    profile?.name ||
    (address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Profile");
  const displayAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : "";

  const { address: connectedAddress } = useAccount();
  const isOwner =
    !!connectedAddress &&
    !!address &&
    connectedAddress.toLowerCase() === address.toLowerCase();

  const balanceQuery = useGetActivityTokenBalance(address as `0x${string}`);
  const formattedBalance = useMemo(() => {
    const raw = balanceQuery.data?.raw;
    const decimals = balanceQuery.data?.decimals ?? 18;
    if (raw === undefined) return undefined;
    return formatUnits(raw, decimals);
  }, [balanceQuery.data]);

  return (
    <header className="flex items-start gap-4">
      <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center">
        <User className="h-8 w-8 text-gray-400" />
      </div>
      <div className="flex-1 min-w-0">
        <h1 className="text-2xl font-semibold flex items-center gap-3">
          {displayName}
          {isOwner && (
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
              You
            </span>
          )}
        </h1>
        {displayAddress ? (
          <p className="font-mono text-sm text-gray-600">{displayAddress}</p>
        ) : null}
        <div className="mt-1 flex items-center gap-2 text-xs text-gray-600">
          <Coins className="h-3 w-3" />
          <span>
            {balanceQuery.isLoading ? "…" : (formattedBalance ?? "0")} TGA
          </span>
        </div>
      </div>
    </header>
  );
}

export default ProfileHeader;
