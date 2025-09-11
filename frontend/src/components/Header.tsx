import { ConnectButton } from "@rainbow-me/rainbowkit";

export function Header() {
  // Render ConnectButton directly; this component only runs client-side within Web3Provider

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-900">
              The Guild Genesis
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            <ConnectButton />
          </div>
        </div>
      </div>
    </header>
  );
}
