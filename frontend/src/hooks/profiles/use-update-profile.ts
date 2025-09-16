import { useMutation, type UseMutationResult } from "@tanstack/react-query";
import { useAccount, useSignMessage } from "wagmi";
import type {
  UpdateProfileInput,
  UpdateProfileResponse,
} from "@/lib/types/api";
import { API_BASE_URL } from "@/lib/constants/apiConstants";

async function putUpdateProfile(
  address: string,
  body: Omit<UpdateProfileInput, "siweMessage">,
  signerAddress: string,
  signature: string,
  siweMessage: string
): Promise<UpdateProfileResponse> {
  const response = await fetch(`${API_BASE_URL}/profiles/${address}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "x-eth-address": signerAddress,
      "x-eth-signature": signature,
      "x-siwe-message": siweMessage,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      `Failed to update profile: ${response.status} ${response.statusText}${
        text ? ` - ${text}` : ""
      }`
    );
  }

  try {
    return (await response.json()) as UpdateProfileResponse;
  } catch {
    return {} as UpdateProfileResponse;
  }
}

type MutationVariables = {
  input: UpdateProfileInput;
};

export function useUpdateProfile(): UseMutationResult<
  UpdateProfileResponse,
  Error,
  MutationVariables
> {
  const { address } = useAccount();
  const { signMessageAsync } = useSignMessage();

  return useMutation<UpdateProfileResponse, Error, MutationVariables>({
    mutationKey: ["update-profile"],
    mutationFn: async ({ input }) => {
      if (!address) throw new Error("Wallet not connected");
      const signature = await signMessageAsync({ message: input.siweMessage });
      const { siweMessage, ...rest } = input;
      return putUpdateProfile(address, rest, address, signature, siweMessage);
    },
  });
}
