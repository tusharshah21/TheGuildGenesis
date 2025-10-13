import { useQuery } from "@tanstack/react-query";
import { API_BASE_URL } from "@/lib/constants/apiConstants";

async function getNonce(walletAddress: string): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/auth/nonce/${walletAddress}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      `Failed to get nonce: ${response.status} ${response.statusText}${
        text ? ` - ${text}` : ""
      }`
    );
  }

  const data = await response.json();
  // Convert nonce number to string for signing
  return data.nonce?.toString() || data.toString();
}

export function useGetNonce(walletAddress: string | undefined) {
  return useQuery({
    queryKey: ["nonce", walletAddress],
    queryFn: () => {
      if (!walletAddress) {
        throw new Error("Wallet address is required");
      }
      return getNonce(walletAddress);
    },
    enabled: !!walletAddress,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
}