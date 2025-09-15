type ProfileBadge = {
  id: string;
  name: string;
  description: string;
  issuer: string;
};

export type Profile = {
  address: string;
  name?: string;
  description?: string;
  badgeCount: number;
  badges: ProfileBadge[];
};

export const PROFILES: Profile[] = [
  {
    address: "0x1234...5678",
    name: "Alice Developer",
    description: "Full-stack developer passionate about Web3 and Rust",
    badgeCount: 5,
    badges: [
      {
        id: "1",
        name: "Rust",
        description: "Rust programming",
        issuer: "0xabcd...1234",
      },
      {
        id: "2",
        name: "React",
        description: "React development",
        issuer: "0xefgh...5678",
      },
      {
        id: "3",
        name: "Web3",
        description: "Blockchain development",
        issuer: "0xijkl...9012",
      },
    ],
  },
  {
    address: "0x9876...5432",
    name: "Bob Builder",
    description: "Smart contract developer and DeFi enthusiast",
    badgeCount: 3,
    badges: [
      {
        id: "4",
        name: "Solidity",
        description: "Smart contract development",
        issuer: "0xmnop...3456",
      },
      {
        id: "5",
        name: "DeFi",
        description: "Decentralized Finance",
        issuer: "0xqrst...7890",
      },
    ],
  },
  {
    address: "0x5555...7777",
    badgeCount: 2,
    badges: [
      {
        id: "6",
        name: "TypeScript",
        description: "TypeScript development",
        issuer: "0xuvwx...1234",
      },
    ],
  },
];
