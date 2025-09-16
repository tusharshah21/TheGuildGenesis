import { useMemo } from "react";
import { useReadContract, useReadContracts } from "wagmi";
import type { Address } from "viem";
import { decodeAbiParameters } from "viem";

export type AttestationItem = {
  issuer: string;
  recipient: string;
  badgeName: string;
  attestationJustification: string;
};

const ACTIVITY_TOKEN_ADDRESS = (import.meta.env.PUBLIC_ACTIVITY_TOKEN_ADDRESS ||
  "") as Address;

// Minimal ABI fragments we need from TheGuildActivityToken / EAS
const activityTokenAbi = [
  {
    type: "function",
    name: "getAttestationCount",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "getAttestationAtIndex",
    stateMutability: "view",
    inputs: [{ name: "index", type: "uint256" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "uid", type: "bytes32" },
          { name: "schema", type: "bytes32" },
          { name: "time", type: "uint64" },
          { name: "expirationTime", type: "uint64" },
          { name: "revocationTime", type: "uint64" },
          { name: "refUID", type: "bytes32" },
          { name: "recipient", type: "address" },
          { name: "attester", type: "address" },
          { name: "revocable", type: "bool" },
          { name: "data", type: "bytes" },
          { name: "bump", type: "uint32" },
        ],
      },
    ],
  },
] as const;

function bytes32ToString(value: `0x${string}`): string {
  try {
    // viem utils: to strip null bytes and decode
    const bytes = new TextDecoder();
    // fallback simple decode by removing trailing zeros and interpreting as utf8
    // Convert hex to Uint8Array
    const hex = value.startsWith("0x") ? value.slice(2) : value;
    const arr = new Uint8Array(hex.length / 2);
    for (let i = 0; i < arr.length; i++) {
      arr[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
    }
    // Trim trailing zeros
    let end = arr.length;
    while (end > 0 && arr[end - 1] === 0) end--;
    return bytes.decode(arr.subarray(0, end));
  } catch (_e) {
    return "";
  }
}

function tryDecodeBadgeData(data: `0x${string}` | null | undefined): {
  badgeName: string;
  justification: string;
} {
  if (!data) return { badgeName: "", justification: "" };
  try {
    const [nameBytes, justificationBytes] = decodeAbiParameters(
      [{ type: "bytes32" }, { type: "bytes32" }],
      data
    ) as [`0x${string}`, `0x${string}`];
    return {
      badgeName: bytes32ToString(nameBytes),
      justification: bytes32ToString(justificationBytes),
    };
  } catch {
    return { badgeName: "", justification: "" };
  }
}

export function useGetAttestations(): {
  data: AttestationItem[] | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
} {
  const address = ACTIVITY_TOKEN_ADDRESS;

  const countQuery = useReadContract({
    abi: activityTokenAbi,
    address,
    functionName: "getAttestationCount",
    query: { enabled: Boolean(address) },
  });

  const count = Number((countQuery.data as bigint | undefined) ?? 0n);

  const attestationCalls = useMemo(
    () =>
      count > 0
        ? Array.from({ length: count }, (_, i) => ({
            abi: activityTokenAbi,
            address,
            functionName: "getAttestationAtIndex" as const,
            args: [BigInt(i)],
          }))
        : [],
    [address, count]
  );

  const listQuery = useReadContracts({
    contracts: attestationCalls,
    allowFailure: false,
    query: { enabled: Boolean(address) && count > 0 },
  });

  const data: AttestationItem[] | undefined = useMemo(() => {
    const results = listQuery.data as
      | Array<{
          attester: `0x${string}`;
          bump: number;
          data: `0x${string}`;
          expirationTime: bigint;
          recipient: `0x${string}`;
          refUID: `0x${string}`;
          revocable: boolean;
          revocationTime: bigint;
          schema: `0x${string}`;
          time: bigint;
          uid: `0x${string}`;
        }>
      | undefined;
    if (!results) return undefined;
    return results.map((r) => {
      const recipient = r.recipient as string;
      const issuer = r.attester as string;
      const bytesData = r.data as `0x${string}`;
      const { badgeName, justification } = tryDecodeBadgeData(bytesData);
      return {
        issuer,
        recipient,
        badgeName,
        attestationJustification: justification,
      };
    });
  }, [listQuery.data]);

  const isLoading = countQuery.isLoading || listQuery.isLoading;
  const error =
    (countQuery.error as Error | null) ||
    (listQuery.error as Error | null) ||
    null;

  return { data, isLoading, error, refetch: countQuery.refetch };
}
