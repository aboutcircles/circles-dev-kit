"use client";

import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from "next-themes";
import * as React from "react";
import { HeroUIProvider } from "@heroui/system";
import { useRouter } from "next/navigation";
import { createConfig, WagmiConfig, http } from "wagmi";
import { gnosis } from "viem/chains";
import {
  injected,
  metaMask,
  walletConnect,
  coinbaseWallet,
} from "@wagmi/connectors";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export interface ProvidersProps {
  children: React.ReactNode;
  themeProps?: ThemeProviderProps;
}

const SUPPORTED_CHAINS = [gnosis] as const;

// Create connectors array based on available configuration
const createConnectors = () => {
  const connectors = [injected(), metaMask(), coinbaseWallet()];

  // Only add WalletConnect if project ID is properly configured
  const walletConnectProjectId =
    process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

  if (walletConnectProjectId && walletConnectProjectId !== "default") {
    try {
      connectors.push(
        walletConnect({
          projectId: walletConnectProjectId,
        }) as any, // Type assertion due to version compatibility issues
      );
    } catch (error) {
      console.warn("Failed to create WalletConnect connector:", error);
    }
  } else {
    // eslint-disable-next-line no-console
    console.log(
      "WalletConnect not configured. Available wallet options: MetaMask, Coinbase Wallet, and browser injected wallets.",
    );
  }

  return connectors;
};

const wagmiConfig = createConfig({
  chains: SUPPORTED_CHAINS,
  transports: {
    [gnosis.id]: http(),
  },
  connectors: createConnectors(),
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if (error && typeof error === "object" && "status" in error) {
          const status = (error as { status: number }).status;

          if (status >= 400 && status < 500) return false;
        }

        return failureCount < 3;
      },
    },
  },
});

export function Providers({ children, themeProps }: ProvidersProps) {
  const router = useRouter();

  return (
    <HeroUIProvider navigate={router.push}>
      <NextThemesProvider {...themeProps}>
        <WagmiConfig config={wagmiConfig}>
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        </WagmiConfig>
      </NextThemesProvider>
    </HeroUIProvider>
  );
}
