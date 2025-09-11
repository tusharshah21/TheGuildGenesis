import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Header } from "../components/Header";

// Mock RainbowKit ConnectButton (keeps test lightweight)
vi.mock("@rainbow-me/rainbowkit", () => ({
  ConnectButton: () => <div data-testid="connect-button">Connect Wallet</div>,
}));

describe("Header", () => {
  it("renders title and connect button", () => {
    render(<Header />);
    expect(screen.getByText("The Guild Genesis")).toBeInTheDocument();
    expect(screen.getByTestId("connect-button")).toBeInTheDocument();
  });
});
