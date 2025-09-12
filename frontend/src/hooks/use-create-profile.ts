import { useMutation, type UseMutationResult } from "@tanstack/react-query";

export type CreateProfileInput = {
  name: string;
  description?: string;
  avatar_url?: string;
};

export type CreateProfileHeaders = {
  ethAddress: string; // 0x...
  ethSignature: string; // signature hex string
  siweMessage: string; // SIWE message or nonce
};

// Unknown response shape from backend; expose as unknown for consumers to refine
export type CreateProfileResponse = unknown;

const API_BASE_URL: string =
  import.meta.env.PUBLIC_API_URL || "http://0.0.0.0:3001";

async function postCreateProfile(
  input: CreateProfileInput,
  headers: CreateProfileHeaders
): Promise<CreateProfileResponse> {
  const response = await fetch(`${API_BASE_URL}/profiles/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-eth-address": headers.ethAddress,
      "x-eth-signature": headers.ethSignature,
      "x-siwe-message": headers.siweMessage,
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
  headers: CreateProfileHeaders;
};

export function useCreateProfile(): UseMutationResult<
  CreateProfileResponse,
  Error,
  MutationVariables
> {
  return useMutation<CreateProfileResponse, Error, MutationVariables>({
    mutationKey: ["create-profile"],
    mutationFn: async ({ input, headers }) => postCreateProfile(input, headers),
  });
}
