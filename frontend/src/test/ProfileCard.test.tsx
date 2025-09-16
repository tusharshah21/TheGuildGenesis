import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ProfileCard } from "../components/profiles/list/ProfileCard";
import React from "react";

// Mock window.matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock wagmi
vi.mock("wagmi", () => ({
  WagmiProvider: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  useAccount: () => ({ address: undefined }),
  useSignMessage: () => ({ signMessageAsync: vi.fn() }),
}));

// Mock RainbowKit
vi.mock("@rainbow-me/rainbowkit", () => ({
  ConnectButton: () => <div data-testid="connect-button">Connect Wallet</div>,
  RainbowKitProvider: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  getDefaultConfig: () => ({}),
}));

// Mock the wagmi config
vi.mock("@/lib/wagmi", () => ({
  config: {},
}));

describe("ProfileCard", () => {
  it("renders minimal profile and badge count", () => {
    render(
      <ProfileCard
        address="0x1234567890123456789012345678901234567890"
        badgeCount={2}
        badges={[
          {
            id: "1",
            name: "Rust",
            description: "Rust programming",
            issuer: "0xabcd",
          },
          {
            id: "2",
            name: "React",
            description: "React development",
            issuer: "0xefgh",
          },
        ]}
      />
    );

    // Name falls back to truncated address, and the address appears in description line too
    expect(screen.getAllByText("0x1234...7890").length).toBeGreaterThan(0);
    expect(screen.getByText("2 badges")).toBeInTheDocument();
    expect(screen.getByText("Rust")).toBeInTheDocument();
    expect(screen.getByText("React")).toBeInTheDocument();
  });
});
