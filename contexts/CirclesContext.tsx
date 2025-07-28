"use client";

import React, { createContext, useState, useEffect, ReactNode } from "react";
import { Sdk } from "@circles-sdk/sdk";
import { BrowserProviderContractRunner } from "@circles-sdk/adapter-ethers";

interface CirclesContextValue {
  sdk: Sdk | null;
  isLoading: boolean;
  error: Error | null;
}

export const CirclesContext = createContext<CirclesContextValue>({
  sdk: null,
  isLoading: true,
  error: null,
});

export function CirclesProvider({ children }: { children: ReactNode }) {
  const [sdk, setSdk] = useState<Sdk | null>(null);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const adapter = new BrowserProviderContractRunner();
        await adapter.init();
        const circlesSdk = new Sdk(adapter);
        setSdk(circlesSdk);
      } catch (err: any) {
        setError(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <CirclesContext.Provider value={{ sdk, isLoading, error }}>
      {children}
    </CirclesContext.Provider>
  );
}