"use client";

import React, {
  createContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
  useMemo,
} from "react";
import { Sdk } from "@circles-sdk/sdk";
import { BrowserProviderContractRunner } from "@circles-sdk/adapter-ethers";

interface CirclesContextValue {
  sdk: Sdk | null;
  isLoading: boolean;
  error: Error | null;
  reconnect: () => Promise<void>;
}

const CirclesContext = createContext<CirclesContextValue | undefined>(
  undefined,
);

interface CirclesProviderProps {
  children: ReactNode;
}

export function CirclesProvider({ children }: CirclesProviderProps) {
  const [sdk, setSdk] = useState<Sdk | null>(null);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const initializeSDK = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const adapter = new BrowserProviderContractRunner();

      await adapter.init();
      const circlesSdk = new Sdk(adapter as any); // Type assertion due to exactOptionalPropertyTypes

      setSdk(circlesSdk);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));

      setError(error);
      // eslint-disable-next-line no-console
      console.error("Failed to initialize Circles SDK:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const reconnect = useCallback(async () => {
    await initializeSDK();
  }, [initializeSDK]);

  useEffect(() => {
    initializeSDK();
  }, [initializeSDK]);

  const contextValue = useMemo<CirclesContextValue>(
    () => ({
      sdk,
      isLoading,
      error,
      reconnect,
    }),
    [sdk, isLoading, error, reconnect],
  );

  return (
    <CirclesContext.Provider value={contextValue}>
      {children}
    </CirclesContext.Provider>
  );
}

export function useCircles(): CirclesContextValue {
  const context = React.useContext(CirclesContext);

  if (context === undefined) {
    throw new Error("useCircles must be used within a CirclesProvider");
  }

  return context;
}
