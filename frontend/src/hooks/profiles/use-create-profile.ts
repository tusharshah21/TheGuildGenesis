import { useMutation, type UseMutationResult } from "@tanstack/react-query";
import { useAccount, useSignMessage } from "wagmi";
import type { CreateProfileInput } from "@/lib/types/api";
import type { CreateProfileResponse } from "@/lib/types/api";
import { API_BASE_URL } from "@/lib/constants/apiConstants";

async function postCreateProfile(
  input: CreateProfileInput,
  address: string,
  signature: string
): Promise<CreateProfileResponse> {
  const response = await fetch(`${API_BASE_URL}/profiles/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-eth-address": address,
      "x-eth-signature": signature,
      "x-siwe-message": input.siweMessage,
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      `Failed to create profile: ${response.status} ${response.statusText}${
        text ? ` - ${text}` : ""
      }`
    );
  }

  // Attempt to parse JSON, but allow empty body
  try {
    return (await response.json()) as CreateProfileResponse;
  } catch {
    return {} as CreateProfileResponse;
  }
}

type MutationVariables = {
  input: CreateProfileInput;
};

export function useCreateProfile(): UseMutationResult<
  CreateProfileResponse,
  Error,
  MutationVariables
> {
  const { address } = useAccount();
  const { signMessageAsync } = useSignMessage();

  return useMutation<CreateProfileResponse, Error, MutationVariables>({
    mutationKey: ["create-profile"],
    mutationFn: async ({ input }) => {
      if (!address) {
        throw new Error("Wallet not connected");
      }
      const signature = await signMessageAsync({ message: input.siweMessage });
      return postCreateProfile(input, address, signature);
    },
  });
}
