import { useMutation, type UseMutationResult, useQueryClient } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import type {
  DeleteProfileInput,
  DeleteProfileResponse,
} from "@/lib/types/api";
import { API_BASE_URL } from "@/lib/constants/apiConstants";

async function deleteProfile(
  address: string,
  signerAddress: string,
  signature: string
): Promise<DeleteProfileResponse> {
  const response = await fetch(`${API_BASE_URL}/profiles/${address}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      "x-eth-address": signerAddress,
      "x-eth-signature": signature,
    },
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      `Failed to delete profile: ${response.status} ${response.statusText}${
        text ? ` - ${text}` : ""
      }`
    );
  }

  try {
    return (await response.json()) as DeleteProfileResponse;
  } catch {
    return {} as DeleteProfileResponse;
  }
}

type MutationVariables = {
  signature: string;
};

export function useDeleteProfile(): UseMutationResult<
  DeleteProfileResponse,
  Error,
  MutationVariables
> {
  const { address } = useAccount();
  const queryClient = useQueryClient();

  return useMutation<DeleteProfileResponse, Error, MutationVariables>({
    mutationKey: ["delete-profile"],
    mutationFn: async ({ signature }) => {
      if (!address) throw new Error("Wallet not connected");
      return deleteProfile(address, address, signature);
    },
    onSuccess: () => {
      // Invalidate nonce query since it was incremented
      queryClient.invalidateQueries({ queryKey: ["nonce", address] });
    },
  });
}
