import { useMemo } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { encodeAbiParameters } from "viem";
import { easAbi } from "@/lib/abis/easAbi";
import {
  EAS_CONTRACT_ADDRESS,
  SCHEMA_ID,
} from "@/lib/constants/blockchainConstants";

function stringToBytes32(value: string): `0x${string}` {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(value);
  const out = new Uint8Array(32);
  const len = Math.min(32, bytes.length);
  for (let i = 0; i < len; i++) out[i] = bytes[i];
  let hex = "0x";
  for (let i = 0; i < out.length; i++)
    hex += out[i].toString(16).padStart(2, "0");
  return hex as `0x${string}`;
}

function encodeBadgeData(
  badgeName: `0x${string}`,
  justification: `0x${string}`
) {
  // Encode according to schema: bytes32 badgeName, bytes32 justification
  return encodeAbiParameters(
    [{ type: "bytes32" }, { type: "bytes32" }],
    [badgeName, justification]
  );
}

export function useCreateAttestation() {
  const {
    writeContractAsync,
    data: hash,
    isPending,
    error,
    reset,
  } = useWriteContract();

  const createAttestation = useMemo(() => {
    return async (
      recipient: `0x${string}`,
      badgeName: string,
      justification: string
    ) => {
      // Convert strings to bytes32
      const badgeNameBytes = stringToBytes32(badgeName);
      const justificationBytes = stringToBytes32(justification);

      // Encode data according to schema
      const encodedData = encodeBadgeData(badgeNameBytes, justificationBytes);
      // Call EAS.attest via wagmi
      const uid = await writeContractAsync({
        abi: easAbi,
        address: EAS_CONTRACT_ADDRESS,
        functionName: "attest",
        args: [
          {
            schema: SCHEMA_ID,
            data: {
              recipient,
              expirationTime: 0n,
              revocable: true,
              refUID:
                "0x0000000000000000000000000000000000000000000000000000000000000000",
              data: encodedData,
              value: 0n,
            },
          },
        ],
        // value: 0n, // no ETH
      });

      return uid;
    };
  }, [writeContractAsync]);

  const wait = useWaitForTransactionReceipt({
    hash: hash as `0x${string}` | undefined,
    query: { enabled: Boolean(hash) },
  });

  return {
    createAttestation,
    hash,
    isPending,
    error,
    reset,
    isConfirming: wait.isLoading,
    isConfirmed: wait.isSuccess,
    receipt: wait.data,
  };
}
