// ABI fragments for the required contract read methods
export const badgeRegistryAbi = [
  {
    type: "function",
    name: "totalBadges",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "getBadgeAt",
    stateMutability: "view",
    inputs: [{ name: "index", type: "uint256" }],
    outputs: [
      { name: "", type: "bytes32" },
      { name: "", type: "bytes32" },
      { name: "", type: "address" },
    ],
  },
  {
    type: "function",
    name: "createBadge",
    stateMutability: "nonpayable",
    inputs: [
      { name: "name", type: "bytes32" },
      { name: "description", type: "bytes32" },
    ],
    outputs: [],
  },
] as const;
