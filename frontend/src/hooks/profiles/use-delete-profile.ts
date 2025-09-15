import { useMutation, type UseMutationResult } from "@tanstack/react-query";
import { useAccount, useSignMessage } from "wagmi";

export type DeleteProfileInput = {
  siweMessage: string;
};

export type DeleteProfileResponse = unknown;

const API_BASE_URL: string =
  import.meta.env.PUBLIC_API_URL || "http://0.0.0.0:3001";

async function deleteProfile(
  address: string,
  signerAddress: string,
  signature: string,
  siweMessage: string
): Promise<DeleteProfileResponse> {
  const response = await fetch(`${API_BASE_URL}/profiles/${address}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      "x-eth-address": signerAddress,
      "x-eth-signature": signature,
      "x-siwe-message": siweMessage,
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
  input: DeleteProfileInput;
};

export function useDeleteProfile(): UseMutationResult<
  DeleteProfileResponse,
  Error,
  MutationVariables
> {
  const { address } = useAccount();
  const { signMessageAsync } = useSignMessage();

  return useMutation<DeleteProfileResponse, Error, MutationVariables>({
    mutationKey: ["delete-profile"],
    mutationFn: async ({ input }) => {
      if (!address) throw new Error("Wallet not connected");
      const signature = await signMessageAsync({ message: input.siweMessage });
      return deleteProfile(address, address, signature, input.siweMessage);
    },
  });
}
