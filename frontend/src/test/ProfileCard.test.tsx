import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ProfileCard } from "../components/ProfileCard";

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
