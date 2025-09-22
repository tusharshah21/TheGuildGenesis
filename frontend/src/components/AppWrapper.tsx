import "@rainbow-me/rainbowkit/styles.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { config } from "../lib/wagmi";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ActivityTokenBalance } from "@/components/ActivityTokenBalance";

const queryClient = new QueryClient();

interface Web3ProviderProps {
  children: React.ReactNode;
}

export function AppWrapper({ children }: Web3ProviderProps) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
              <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="flex justify-between items-center h-16">
                    <div className="flex items-center gap-3">
                      <SidebarTrigger />
                      <h1 className="text-xl font-bold text-gray-900">
                        The Guild Genesis
                      </h1>
                    </div>

                    <div className="flex items-center space-x-4">
                      <ActivityTokenBalance />
                      <ConnectButton />
                    </div>
                  </div>
                </div>
              </header>

              <main>{children}</main>
            </SidebarInset>
          </SidebarProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
