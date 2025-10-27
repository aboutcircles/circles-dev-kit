"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Chip } from "@heroui/chip";
import { Spinner } from "@heroui/spinner";
import { Divider } from "@heroui/divider";
import { useAccount, useConnect } from "wagmi";

import { useCircles } from "@/contexts/CirclesContext";

// Constants from CirclesContext
const MAX_RETRY_ATTEMPTS = 5;

/* ================================================================================================
 * ConnectWalletProfileButton
 * -----------------------------------------------------------------------------------------------
 * - Connects a wallet (wagmi).
 * - If wallet has a Circles avatar, shows: Profile name, short address, total CRC balance.
 * - Uses ONLY:
 *     sdk.getAvatar(address)
 *     sdk.profiles.get(cidV0)   // for name, if present
 *     avatar.getTotalBalance()  // total CRC
 * ================================================================================================= */

const ConnectWalletProfileButton: React.FC = () => {
  const { isConnected, address } = useAccount();
  const { connect, connectors, isPending: isConnecting } = useConnect();
  const {
    sdk,
    isLoading: sdkLoading,
    error,
    reconnect,
    isConnected: sdkConnected,
  } = useCircles();

  const [checking, setChecking] = useState(false);
  const [profileName, setProfileName] = useState<string | undefined>();
  const [totalBalance, setTotalBalance] = useState<string | undefined>();

  const load = useCallback(async () => {
    if (!sdk || !address || !sdkConnected) return;
    setChecking(true);
    try {
      const avatar: any = await sdk.getAvatar(address);

      // Resolve profile name from profile CID (preferred) or avatarInfo.name
      let name: string | undefined;
      const info = avatar?.avatarInfo;

      if (info?.cidV0 && sdk.profiles) {
        try {
          const prof = await sdk.profiles.get(info.cidV0);

          if (prof?.name) name = prof.name;
        } catch {
          /* ignore and fall back to info.name */
        }
      }
      if (!name && info?.name) name = info.name;
      setProfileName(name);

      // Total balance
      try {
        const bal = await avatar.getTotalBalance();

        setTotalBalance(bal?.toString());
      } catch {
        setTotalBalance(undefined);
      }
    } catch (e) {
      // Not a Circles avatar or provider not ready
      setProfileName(undefined);
      setTotalBalance(undefined);

      if (e instanceof Error && e.message.includes("WebSocket")) {
        console.error("WebSocket connection error during profile load:", e);
      } else {
        console.error("Circles Connect/Profile load failed:", e);
      }
    } finally {
      setChecking(false);
    }
  }, [sdk, address, sdkConnected]);

  useEffect(() => {
    if (isConnected && sdk && sdkConnected) {
      load();
    } else {
      setProfileName(undefined);
      setTotalBalance(undefined);
    }
  }, [isConnected, sdk, sdkConnected, address, load]);

  const short = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "";

  if (!isConnected) {
    return (
      <Button
        color="primary"
        disabled={isConnecting || sdkLoading}
        isLoading={isConnecting || sdkLoading}
        onClick={() => connectors[0] && connect({ connector: connectors[0] })}
      >
        {isConnecting || sdkLoading ? "Connecting…" : "Connect Wallet"}
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button disabled color="primary" variant="flat">
        {checking ? (
          <span className="flex items-center gap-2">
            <Spinner size="sm" /> Loading Circles…
          </span>
        ) : profileName ? (
          <span className="flex items-center gap-2">
            <strong>{profileName}</strong>
            {typeof totalBalance !== "undefined" && (
              <span>– {totalBalance} CRC</span>
            )}
            <span className="opacity-80">{short}</span>
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Chip color="default" size="sm" variant="flat">
              No Profile
            </Chip>
            <span>{short}</span>
          </span>
        )}
      </Button>

      {/* If SDK failed to init, surface a retry */}
      {error && (
        <Button size="sm" onClick={reconnect}>
          Re-init SDK
        </Button>
      )}
    </div>
  );
};

/* ================================================================================================
 * CirclesProfileSearchBar
 * -----------------------------------------------------------------------------------------------
 * - Search profiles by address (0x...) or name (partial).
 * - Uses ONLY sdk.profiles.searchByAddress / searchByName.
 * ================================================================================================= */

const CirclesProfileSearchBar: React.FC = () => {
  const { sdk, isLoading: sdkLoading, error, reconnect } = useCircles();
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  const handleSearch = async () => {
    if (!sdk?.profiles || !query) return;
    setIsSearching(true);
    setNotFound(false);
    try {
      let found: any[] = [];

      if (query.startsWith("0x")) {
        const r = await (sdk.profiles as any).searchByAddress(query);

        found = Array.isArray(r) ? r : r ? [r] : [];
      } else {
        found = await (sdk.profiles as any).searchByName(query);
      }
      setResults(found ?? []);
      setNotFound((found ?? []).length === 0);
    } catch (e) {
      console.error("Profile search failed:", e);
      setResults([]);
      setNotFound(true);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div>
      <div className="flex gap-2">
        <Input
          className="w-full"
          placeholder="Search by name or address…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <Button
          color="primary"
          disabled={!query || isSearching || sdkLoading}
          onClick={handleSearch}
        >
          {isSearching ? "Searching…" : "Search"}
        </Button>
      </div>

      {error && (
        <div className="mt-2 flex items-center gap-2">
          <Chip color="warning" size="sm" variant="flat">
            SDK error
          </Chip>
          <Button size="sm" onClick={reconnect}>
            Re-init SDK
          </Button>
        </div>
      )}

      <div className="mt-4">
        {isSearching && (
          <div className="flex items-center gap-2 text-default-600 mb-3">
            <Spinner size="sm" />
            <span>Searching profiles…</span>
          </div>
        )}
        {notFound && !isSearching && (
          <div className="text-default-500 mb-3">
            No profiles found for “{query}”.
          </div>
        )}

        {results.map((p: any) => (
          <div
            key={p.CID || p.address}
            className="p-3 mb-3 bg-content2 rounded border"
          >
            <div className="font-medium text-primary">
              {p.name || "(No name)"}
            </div>
            <div className="text-sm text-default-600">{p.address}</div>
            {p.description && (
              <div className="text-xs text-default-500 mt-1">
                {p.description}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

/* ================================================================================================
 * TrustConnectionsManager
 * -----------------------------------------------------------------------------------------------
 * - Minimal trust controls that do NOT enumerate the trust graph (to avoid any WS-backed calls).
 * - Uses ONLY:
 *     sdk.getAvatar(address)
 *     avatar.trust(target)
 *     avatar.untrust(target)
 * ================================================================================================= */

const TrustConnectionsManager: React.FC = () => {
  const { address, isConnected } = useAccount();
  const {
    sdk,
    isLoading: sdkLoading,
    error,
    reconnect,
    isConnected: sdkConnected,
  } = useCircles();

  const [avatar, setAvatar] = useState<any>();
  const [targetAddr, setTargetAddr] = useState("");
  const [busy, setBusy] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string>("");

  const boot = useCallback(async () => {
    if (!sdk || !address || !sdkConnected) {
      setAvatar(undefined);

      return;
    }
    try {
      const av = await sdk.getAvatar(address);

      setAvatar(av);
    } catch (e) {
      setAvatar(undefined);
      if (e instanceof Error && e.message.includes("WebSocket")) {
        console.error(
          "WebSocket connection error during avatar load (trust):",
          e,
        );
      } else {
        console.error("Failed to get avatar (trust):", e);
      }
    }
  }, [sdk, address, sdkConnected]);

  useEffect(() => {
    if (isConnected && sdk && sdkConnected) boot();
    else setAvatar(undefined);
  }, [isConnected, sdk, sdkConnected, boot]);

  const trust = async () => {
    if (!avatar || !targetAddr) return;
    setBusy(true);
    setStatusMsg("");
    try {
      await avatar.trust(targetAddr);
      setStatusMsg(`Trusted: ${targetAddr}`);
      setTargetAddr("");
    } catch (e) {
      console.error("Trust failed:", e);
      setStatusMsg("Trust failed. Ensure the address is a Circles avatar.");
    } finally {
      setBusy(false);
    }
  };

  const untrust = async () => {
    if (!avatar || !targetAddr) return;
    setBusy(true);
    setStatusMsg("");
    try {
      await avatar.untrust(targetAddr);
      setStatusMsg(`Untrusted: ${targetAddr}`);
      setTargetAddr("");
    } catch (e) {
      console.error("Untrust failed:", e);
      setStatusMsg("Untrust failed.");
    } finally {
      setBusy(false);
    }
  };

  if (!isConnected) return <div>Connect your wallet to manage trust.</div>;
  if (!avatar)
    return (
      <div className="flex items-center gap-2">
        <span>This wallet is not a Circles avatar or SDK not ready.</span>
        {(error || sdkLoading) && (
          <Button size="sm" onClick={reconnect}>
            Re-init SDK
          </Button>
        )}
      </div>
    );

  return (
    <div>
      <div className="flex gap-2">
        <Input
          className="w-full"
          disabled={busy}
          placeholder="Address to trust/untrust"
          value={targetAddr}
          onChange={(e) => setTargetAddr(e.target.value)}
        />
        <Button color="success" disabled={!targetAddr || busy} onClick={trust}>
          {busy ? "Working…" : "Trust"}
        </Button>
        <Button
          color="default"
          disabled={!targetAddr || busy}
          onClick={untrust}
        >
          {busy ? "Working…" : "Untrust"}
        </Button>
      </div>
      {statusMsg && (
        <div className="mt-2 text-default-600 text-sm">{statusMsg}</div>
      )}
    </div>
  );
};

/* ================================================================================================
 * CirclesTransferForm
 * -----------------------------------------------------------------------------------------------
 * - Minimal transfer form.
 * - Uses ONLY:
 *     sdk.getAvatar(address)
 *     avatar.transfer(recipient, amountNumber)
 * ================================================================================================= */

const CirclesTransferForm: React.FC = () => {
  const { isConnected, address } = useAccount();
  const {
    sdk,
    isLoading: sdkLoading,
    error,
    reconnect,
    isConnected: sdkConnected,
  } = useCircles();

  const [avatar, setAvatar] = useState<any>();
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [sending, setSending] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string>("");

  const boot = useCallback(async () => {
    if (!sdk || !address || !sdkConnected) {
      setAvatar(undefined);

      return;
    }
    try {
      const av = await sdk.getAvatar(address);

      setAvatar(av);
    } catch (e) {
      setAvatar(undefined);
      if (e instanceof Error && e.message.includes("WebSocket")) {
        console.error(
          "WebSocket connection error during avatar load (transfer):",
          e,
        );
      } else {
        console.error("Failed to get avatar (transfer):", e);
      }
    }
  }, [sdk, address, sdkConnected]);

  useEffect(() => {
    if (isConnected && sdk && sdkConnected) boot();
    else setAvatar(undefined);
  }, [isConnected, sdk, sdkConnected, boot]);

  const send = async () => {
    if (!avatar || !recipient || !amount) return;
    const amt = parseFloat(amount);

    if (!Number.isFinite(amt) || amt <= 0) {
      setStatusMsg("Enter a valid amount.");

      return;
    }
    setSending(true);
    setStatusMsg("");
    try {
      await avatar.transfer(recipient, amt);
      setRecipient("");
      setAmount("");
      setStatusMsg("Transfer successful!");
    } catch (e) {
      console.error("Transfer failed:", e);
      setStatusMsg("Transfer failed. Ensure a valid trust path exists.");
    } finally {
      setSending(false);
    }
  };

  if (!isConnected) return <div>Connect your wallet to send tokens.</div>;
  if (!avatar)
    return (
      <div className="flex items-center gap-2">
        <span>This wallet is not a Circles avatar or SDK not ready.</span>
        {(error || sdkLoading) && (
          <Button size="sm" onClick={reconnect}>
            Re-init SDK
          </Button>
        )}
      </div>
    );

  return (
    <div className="space-y-3">
      <Input
        className="w-full"
        disabled={sending}
        placeholder="Recipient address"
        value={recipient}
        onChange={(e) => setRecipient(e.target.value)}
      />
      <Input
        className="w-full"
        disabled={sending}
        placeholder="Amount (CRC)"
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <Button
        className="w-full"
        color="danger"
        disabled={!recipient || !amount || sending}
        isLoading={sending}
        onClick={send}
      >
        {sending ? "Sending…" : "Send Circles"}
      </Button>
      {statusMsg && <div className="text-default-600 text-sm">{statusMsg}</div>}
    </div>
  );
};

/* ================================================================================================
 * Showcase Page
 * ================================================================================================= */

export default function ComponentsPage() {
  const {
    isLoading,
    error,
    reconnect,
    isConnected: sdkConnected,
    retryCount,
  } = useCircles();

  return (
    <div className="space-y-10">
      <header className="text-center space-y-2">
        <h1 className="text-3xl font-bold">
          Circles SDK — Compact Components Showcase
        </h1>
        <p className="text-default-600">
          Minimal, directly embeddable components using your CirclesProvider
          with enhanced WebSocket connection handling.
        </p>
      </header>

      {/* Connection Status */}
      <div className="flex items-center justify-center gap-3">
        <Chip
          color={sdkConnected ? "success" : "warning"}
          size="sm"
          variant="flat"
        >
          {sdkConnected ? "SDK Connected" : "SDK Disconnected"}
        </Chip>
        {!sdkConnected && retryCount > 0 && (
          <span className="text-sm text-default-600">
            Retry {retryCount}/{MAX_RETRY_ATTEMPTS}
          </span>
        )}
        {!sdkConnected && (
          <Button color="primary" size="sm" variant="flat" onClick={reconnect}>
            Manual Retry
          </Button>
        )}
      </div>

      {/* Global SDK state hint (optional) */}
      {isLoading && (
        <div className="flex items-center gap-2 justify-center">
          <Spinner size="sm" />
          <span>
            {sdkConnected ? "SDK Ready" : "Initializing Circles SDK…"}
          </span>
        </div>
      )}
      {error && (
        <div className="flex items-center gap-3 justify-center">
          <Chip color="warning" size="sm" variant="flat">
            SDK init error
          </Chip>
          <Button size="sm" onClick={reconnect}>
            Re-init SDK
          </Button>
          {(error.message.includes("WebSocket") ||
            error.message.includes("connection") ||
            error.message.includes("timeout")) && (
            <div className="text-xs text-default-500 text-center">
              Connection issue detected. This may be due to network
              connectivity, server availability, or WebSocket connection
              problems.
              <br />
              The app will automatically retry connection attempts.
            </div>
          )}
        </div>
      )}

      {/* Connect & Profile */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">1) Connect & Profile</h2>
        <p className="text-default-600 text-sm">
          If the connected wallet is a Circles avatar, shows profile name, short
          address, and total balance.
        </p>
        <ConnectWalletProfileButton />
      </section>

      <Divider />

      {/* Profile Search */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">2) Profile Search</h2>
        <p className="text-default-600 text-sm">
          Search by name or address (0x…). Results include profile details.
        </p>
        <CirclesProfileSearchBar />
      </section>

      <Divider />

      {/* Trust Manager */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">3) Trust Manager</h2>
        <p className="text-default-600 text-sm">
          Add or remove trust by address (without enumerating the trust graph).
        </p>
        <TrustConnectionsManager />
      </section>

      <Divider />

      {/* Transfer Form */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">4) Token Transfer</h2>
        <p className="text-default-600 text-sm">
          Send Circles tokens to another avatar (requires a valid trust path).
        </p>
        <CirclesTransferForm />
      </section>
    </div>
  );
}
