import { useMemo } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { encodeAbiParameters } from "viem";
import type { Address } from "viem";

const EAS_CONTRACT_ADDRESS = (import.meta.env.PUBLIC_EAS_CONTRACT_ADDRESS ||
  "0xC2679fBD37d54388Ce493F1DB75320D236e1815e") as Address; // Sepolia default

const SCHEMA_ID = (import.meta.env.PUBLIC_SCHEMA_ID ||
  "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef") as `0x${string}`;

// Minimal EAS ABI for `attest((bytes32,(address,uint64,uint64?,bool,bytes32,bytes,uint256)))`.
// Using the 1.4.0 signature from IEAS: attest((bytes32 schema, (address recipient, uint64 expirationTime, bool revocable, bytes32 refUID, bytes data, uint256 value) data))
const easAbi = [
  {
    type: "function",
    name: "attest",
    stateMutability: "payable",
    inputs: [
      {
        name: "request",
        type: "tuple",
        components: [
          { name: "schema", type: "bytes32" },
          {
            name: "data",
            type: "tuple",
            components: [
              { name: "recipient", type: "address" },
              { name: "expirationTime", type: "uint64" },
              { name: "revocable", type: "bool" },
              { name: "refUID", type: "bytes32" },
              { name: "data", type: "bytes" },
              { name: "value", type: "uint256" },
            ],
          },
        ],
      },
    ],
    outputs: [{ name: "uid", type: "bytes32" }],
  },
] as const;

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
