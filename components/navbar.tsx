"use client";

import * as React from "react";
import {
  Navbar as HeroUINavbar,
  NavbarContent,
  NavbarItem,
  NavbarMenu,
  NavbarMenuToggle,
  NavbarBrand,
  NavbarMenuItem,
} from "@heroui/navbar";
import { Link } from "@heroui/link";
import { link as linkStyles } from "@heroui/theme";
import { Button } from "@heroui/button";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import { Chip } from "@heroui/chip";
import NextLink from "next/link";
import clsx from "clsx";
import { usePathname } from "next/navigation";
import {
  useAccount,
  useConnect,
  useDisconnect,
  useChainId,
  useSwitchChain,
  type Connector,
} from "wagmi";
import { injected } from "wagmi/connectors";
import { gnosis } from "wagmi/chains";

import { siteConfig } from "@/config/site";
import { ThemeSwitch } from "@/components/theme-switch";
import { GithubIcon, Logo } from "@/components/icons";

const SUPPORTED_CHAINS = [gnosis] as const;
const CHAIN_NAMES: Record<number, string> = {
  [gnosis.id]: "Gnosis Chain",
};

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const chainId = useChainId();

  const { address, isConnected, isConnecting, isReconnecting, connector } =
    useAccount();
  const { connect, connectors, isPending, error } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain, isPending: isSwitchingChain } = useSwitchChain();

  const [mounted, setMounted] = React.useState(false);
  const [showWalletMenu, setShowWalletMenu] = React.useState(false);
  const [showChainMenu, setShowChainMenu] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Log connection errors to console instead of showing in UI
  React.useEffect(() => {
    if (error) {
      // eslint-disable-next-line no-console
      console.error("Wallet connection error:", {
        message: error.message,
        name: error.name,
        cause: error.cause,
        details: error,
      });
    }
  }, [error]);

  const isOnSupportedChain = React.useMemo(
    () => SUPPORTED_CHAINS.some((chain) => chain.id === chainId),
    [chainId],
  );

  const currentChainName = React.useMemo(
    () => CHAIN_NAMES[chainId] || `Chain ${chainId}`,
    [chainId],
  );

  const handleConnect = React.useCallback(
    async (connectorToUse: Connector) => {
      try {
        await connect({ connector: connectorToUse });
        setShowWalletMenu(false);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("Failed to connect wallet:", err);
      }
    },
    [connect],
  );

  const handleDisconnect = React.useCallback(async () => {
    try {
      await disconnect();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Failed to disconnect wallet:", err);
    }
  }, [disconnect]);

  const handleSwitchChain = React.useCallback(
    async (targetChainId: number) => {
      try {
        await switchChain({ chainId: targetChainId });
        setShowChainMenu(false);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("Failed to switch chain:", err);
      }
    },
    [switchChain],
  );

  const getStatusColor = React.useCallback(() => {
    if (!isConnected) return "default";
    if (!isOnSupportedChain) return "warning";

    return "success";
  }, [isConnected, isOnSupportedChain]);

  const getStatusText = React.useCallback(() => {
    if (isConnecting || isReconnecting) return "Connecting...";
    if (!isConnected) return "Connect Wallet";
    if (!isOnSupportedChain) return "Switch to Gnosis Chain";

    return `${address?.slice(0, 6)}…${address?.slice(-4)}`;
  }, [isConnecting, isReconnecting, isConnected, isOnSupportedChain, address]);

  const WalletButton = React.useCallback(() => {
    if (!mounted) {
      return (
        <Button isLoading size="sm" variant="flat">
          Loading...
        </Button>
      );
    }

    if (isConnected && address) {
      return (
        <div className="flex items-center gap-2">
          {/* Chain Switch Button */}
          <Dropdown isOpen={showChainMenu} onOpenChange={setShowChainMenu}>
            <DropdownTrigger>
              <Button
                className="min-w-0"
                color={isOnSupportedChain ? "success" : "warning"}
                isLoading={isSwitchingChain}
                size="sm"
                variant="flat"
              >
                {currentChainName}
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Chain selection">
              {SUPPORTED_CHAINS.map((chain) => (
                <DropdownItem
                  key={chain.id}
                  className={chainId === chain.id ? "bg-primary/10" : ""}
                  onClick={() => handleSwitchChain(chain.id)}
                >
                  <div className="flex items-center justify-between w-full">
                    <span>{chain.name}</span>
                    {chainId === chain.id && (
                      <span className="text-primary">✓</span>
                    )}
                  </div>
                </DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>

          {/* Wallet Status Button */}
          <Dropdown>
            <DropdownTrigger>
              <Button
                className="flex items-center gap-2"
                color={getStatusColor()}
                size="sm"
                variant="flat"
              >
                {getStatusText()}
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Wallet options">
              <DropdownItem key="address" className="cursor-default">
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-gray-500">Address</span>
                  <code className="text-xs">{address}</code>
                </div>
              </DropdownItem>
              <DropdownItem key="connector" className="cursor-default">
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-gray-500">Connected via</span>
                  <span className="text-xs">{connector?.name}</span>
                </div>
              </DropdownItem>
              <DropdownItem
                key="disconnect"
                color="danger"
                onClick={handleDisconnect}
              >
                Disconnect Wallet
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2">
        <Dropdown isOpen={showWalletMenu} onOpenChange={setShowWalletMenu}>
          <DropdownTrigger>
            <Button
              color="primary"
              isLoading={isPending || isConnecting}
              size="sm"
              variant="flat"
            >
              {isPending || isConnecting ? "Connecting..." : "Connect Wallet"}
            </Button>
          </DropdownTrigger>
          <DropdownMenu aria-label="Wallet connectors">
            {
              connectors
                .filter((connector) => connector.name !== "Injected") // Filter out generic injected
                .map((connector) => (
                  <DropdownItem
                    key={connector.id}
                    className="flex items-center gap-2"
                    onClick={() => handleConnect(connector)}
                  >
                    <span>{connector.name}</span>
                  </DropdownItem>
                )) as any
            }
            {/* Fallback injected connector */}
            <DropdownItem
              key="injected-fallback"
              className="flex items-center gap-2"
              onClick={() => handleConnect(injected() as any)}
            >
              <span>Browser Wallet</span>
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
    );
  }, [
    mounted,
    isConnected,
    address,
    isOnSupportedChain,
    currentChainName,
    isSwitchingChain,
    showChainMenu,
    handleSwitchChain,
    getStatusColor,
    getStatusText,
    showWalletMenu,
    isPending,
    isConnecting,
    connectors,
    handleConnect,
    handleDisconnect,
    chainId,
    connector?.name,
  ]);

  const MobileWalletButton = React.useCallback(() => {
    if (!mounted) return null;

    return (
      <div className="sm:hidden flex items-center gap-2">
        {isConnected && address ? (
          <div className="flex flex-col items-center gap-2">
            <Button
              color={getStatusColor()}
              size="sm"
              variant="flat"
              onClick={handleDisconnect}
            >
              {getStatusText()}
            </Button>
            {!isOnSupportedChain && (
              <Chip color="warning" size="sm" variant="flat">
                Switch to Gnosis Chain
              </Chip>
            )}
          </div>
        ) : (
          <Button
            color="primary"
            isLoading={isPending || isConnecting}
            size="sm"
            variant="flat"
            onClick={() => setShowWalletMenu(true)}
          >
            {isPending || isConnecting ? "Connecting..." : "Connect"}
          </Button>
        )}
      </div>
    );
  }, [
    mounted,
    isConnected,
    address,
    getStatusColor,
    getStatusText,
    handleDisconnect,
    isOnSupportedChain,
    isPending,
    isConnecting,
  ]);

  const navItems = React.useMemo(
    () =>
      siteConfig.navItems.map((item) => {
        const active = pathname === item.href;

        return (
          <NavbarItem key={item.href} isActive={active}>
            <NextLink
              className={clsx(
                linkStyles({ color: "foreground" }),
                "data-[active=true]:text-primary data-[active=true]:font-medium",
              )}
              data-active={active}
              href={item.href}
            >
              {item.label}
            </NextLink>
          </NavbarItem>
        );
      }),
    [pathname],
  );

  const mobileMenuItems = React.useMemo(
    () =>
      siteConfig.navMenuItems.map((item) => (
        <NavbarMenuItem key={item.href} className="w-full text-center">
          <NextLink className="text-lg block w-full" href={item.href}>
            {item.label}
          </NextLink>
        </NavbarMenuItem>
      )),
    [],
  );

  return (
    <HeroUINavbar isBordered maxWidth="xl" position="sticky">
      <NavbarContent className="basis-auto" justify="start">
        <NavbarBrand as="li" className="gap-3 max-w-fit">
          <NextLink className="flex items-center gap-2" href="/">
            <Logo />
            <p className="font-bold">Developer Kit</p>
          </NextLink>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent className="hidden lg:flex flex-1" justify="center">
        <ul className="flex gap-6">{navItems}</ul>
      </NavbarContent>

      <NavbarContent
        className="hidden sm:flex items-center gap-3"
        justify="end"
      >
        <NavbarItem>
          <WalletButton />
        </NavbarItem>
        <NavbarItem>
          <ThemeSwitch />
        </NavbarItem>
      </NavbarContent>

      <NavbarContent className="sm:hidden basis-1 pl-4" justify="end">
        <Link isExternal aria-label="GitHub" href={siteConfig.links.github}>
          <GithubIcon />
        </Link>
        <ThemeSwitch />
        <NavbarMenuToggle />
      </NavbarContent>

      <NavbarMenu>
        <div className="mx-4 mt-4 flex flex-col items-center gap-4">
          <MobileWalletButton />

          {mobileMenuItems}

          {/* Connection Status in Mobile Menu */}
          {mounted && isConnected && (
            <div className="w-full p-4 bg-content2 rounded-lg">
              <div className="text-xs text-gray-500 mb-2">Wallet Status</div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-xs">Network:</span>
                  <Chip
                    color={isOnSupportedChain ? "success" : "warning"}
                    size="sm"
                    variant="flat"
                  >
                    {currentChainName}
                  </Chip>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs">Connector:</span>
                  <span className="text-xs">{connector?.name}</span>
                </div>
                <div className="text-xs">
                  <div className="text-gray-500">Address:</div>
                  <code className="text-xs break-all">{address}</code>
                </div>
              </div>
            </div>
          )}
        </div>
      </NavbarMenu>
    </HeroUINavbar>
  );
};
