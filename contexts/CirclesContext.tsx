"use client";

import React, {
  createContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { Sdk } from "@circles-sdk/sdk";
import { BrowserProviderContractRunner } from "@circles-sdk/adapter-ethers";

interface CirclesContextValue {
  sdk: Sdk | null;
  isLoading: boolean;
  error: Error | null;
  isConnected: boolean;
  reconnect: () => Promise<void>;
  retryCount: number;
}

const CirclesContext = createContext<CirclesContextValue | undefined>(
  undefined,
);

interface CirclesProviderProps {
  children: ReactNode;
}

const MAX_RETRY_ATTEMPTS = 5;
const RETRY_DELAY_MS = 2000;
const CONNECTION_TIMEOUT_MS = 10000;

export function CirclesProvider({ children }: CirclesProviderProps) {
  const [sdk, setSdk] = useState<Sdk | null>(null);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const connectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isInitializingRef = useRef(false);

  const clearTimeouts = useCallback(() => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
    if (connectionTimeoutRef.current) {
      clearTimeout(connectionTimeoutRef.current);
      connectionTimeoutRef.current = null;
    }
  }, []);

  const initializeSDK = useCallback(async () => {
    if (isInitializingRef.current) return;

    try {
      isInitializingRef.current = true;
      setLoading(true);
      setError(null);
      setIsConnected(false);

      // Clear any existing timeouts
      clearTimeouts();

      // Set connection timeout
      connectionTimeoutRef.current = setTimeout(() => {
        const timeoutError = new Error("SDK initialization timed out");

        setError(timeoutError);
        setLoading(false);
        setIsConnected(false);
        isInitializingRef.current = false;
      }, CONNECTION_TIMEOUT_MS);

      const adapter = new BrowserProviderContractRunner();

      // Initialize the adapter with retry logic
      let adapterInitialized = false;
      let attempts = 0;

      while (!adapterInitialized && attempts < MAX_RETRY_ATTEMPTS) {
        try {
          await adapter.init();
          adapterInitialized = true;
        } catch (adapterError) {
          attempts++;
          console.warn(
            `Adapter initialization attempt ${attempts} failed:`,
            adapterError,
          );

          if (attempts < MAX_RETRY_ATTEMPTS) {
            await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
          } else {
            throw new Error(
              `Failed to initialize adapter after ${MAX_RETRY_ATTEMPTS} attempts`,
            );
          }
        }
      }

      const circlesSdk = new Sdk(adapter as any);

      // Test the SDK connection with a simple operation
      try {
        // Wait a bit for WebSocket to establish
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Test connection by trying to access a basic property
        if (circlesSdk && circlesSdk.contractRunner) {
          setIsConnected(true);
          setSdk(circlesSdk);
          setRetryCount(0);
        } else {
          throw new Error("SDK initialization incomplete");
        }
      } catch (testError) {
        throw new Error(
          `SDK connection test failed: ${testError instanceof Error ? testError.message : String(testError)}`,
        );
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));

      // Check if this is a WebSocket-related error
      const isWebSocketError =
        error.message.includes("WebSocket") ||
        error.message.includes("connection") ||
        error.message.includes("timeout");

      setError(error);
      setIsConnected(false);
      setSdk(null);

      // Increment retry count for exponential backoff
      setRetryCount((prev) => prev + 1);

      if (isWebSocketError) {
        console.error(
          "WebSocket connection failed during SDK initialization:",
          error,
        );
      } else {
        console.error("Failed to initialize Circles SDK:", error);
      }

      // Auto-retry with exponential backoff if we haven't exceeded max attempts
      if (retryCount < MAX_RETRY_ATTEMPTS) {
        const delay = RETRY_DELAY_MS * Math.pow(2, retryCount);

        console.log(`Retrying SDK initialization in ${delay}ms...`);

        retryTimeoutRef.current = setTimeout(() => {
          initializeSDK();
        }, delay);
      }
    } finally {
      clearTimeouts();
      setLoading(false);
      isInitializingRef.current = false;
    }
  }, [retryCount, clearTimeouts]);

  const reconnect = useCallback(async () => {
    setRetryCount(0);
    await initializeSDK();
  }, [initializeSDK]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimeouts();
    };
  }, [clearTimeouts]);

  // Initialize on mount
  useEffect(() => {
    initializeSDK();
  }, [initializeSDK]);

  // Monitor connection health
  useEffect(() => {
    if (!sdk || !isConnected) return;

    const healthCheck = async () => {
      try {
        // Simple health check - try to access SDK properties
        if (sdk.contractRunner && sdk.data) {
          // Connection is healthy
          return;
        }
      } catch (error) {
        console.warn("SDK health check failed, attempting reconnection...");
        setIsConnected(false);
        await reconnect();
      }
    };

    const healthCheckInterval = setInterval(healthCheck, 30000); // Check every 30 seconds

    return () => {
      clearInterval(healthCheckInterval);
    };
  }, [sdk, isConnected, reconnect]);

  const contextValue = useMemo<CirclesContextValue>(
    () => ({
      sdk,
      isLoading,
      error,
      isConnected,
      reconnect,
      retryCount,
    }),
    [sdk, isLoading, error, isConnected, reconnect, retryCount],
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
