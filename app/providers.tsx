"use client";

import type { ThemeProviderProps } from "next-themes";
import * as React from "react";
import { HeroUIProvider } from "@heroui/system";
import { useRouter } from "next/navigation";
import { ThemeProvider as NextThemesProvider } from "next-themes";

import { createConfig, WagmiConfig, http } from "wagmi";
import { gnosis } from "viem/chains";
import { injected } from "@wagmi/connectors";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export interface ProvidersProps {
  children: React.ReactNode;
  themeProps?: ThemeProviderProps;
}

const wagmiConfig = createConfig({
  autoConnect: true,
  chains: [gnosis],
  transports: {
    [gnosis.id]: http(),
  },
  connectors: [injected({ chains: [gnosis] })],
});

const queryClient = new QueryClient();

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
