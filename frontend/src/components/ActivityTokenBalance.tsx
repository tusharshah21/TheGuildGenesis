import { useAccount } from "wagmi";
import AddressTokenBalance from "@/components/AddressTokenBalance";

export function ActivityTokenBalance() {
  const { address, isConnected } = useAccount();
  if (!isConnected || !address) return null;
  return <AddressTokenBalance address={address as `0x${string}`} />;
}

export default ActivityTokenBalance;
