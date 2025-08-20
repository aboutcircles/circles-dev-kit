import { CirclesConfig, circlesConfig } from "@circles-sdk/sdk";

export const appCirclesConfig: CirclesConfig =
  circlesConfig[100] ||
  (() => {
    throw new Error("Circles config for chain ID 100 (Gnosis Chain) not found");
  })();
