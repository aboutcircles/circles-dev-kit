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
import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain } from "wagmi";
import { injected, metaMask, walletConnect, coinbaseWallet } from "wagmi/connectors";
import { gnosis, gnosisChiado } from "wagmi/chains";
import { siteConfig } from "@/config/site";
import { ThemeSwitch } from "@/components/theme-switch";
import { GithubIcon, Logo } from "@/components/icons";

const SUPPORTED_CHAINS = [gnosis, gnosisChiado];
const CHAIN_NAMES = {
  [gnosis.id]: "Gnosis",
  [gnosisChiado.id]: "Chiado",
};

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const chainId = useChainId();
  
  const { address, isConnected, isConnecting, isReconnecting, connector } = useAccount();
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
      console.error("Wallet connection error:", {
        message: error.message,
        name: error.name,
        cause: error.cause,
        details: error
      });
    }
  }, [error]);

  const isOnSupportedChain = SUPPORTED_CHAINS.some(chain => chain.id === chainId);
  const currentChainName = CHAIN_NAMES[chainId as keyof typeof CHAIN_NAMES] || `Chain ${chainId}`;

  const handleConnect = async (connectorToUse: any) => {
    try {
      await connect({ connector: connectorToUse });
      setShowWalletMenu(false);
    } catch (err) {
      console.error("Failed to connect wallet:", err);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
    } catch (err) {
      console.error("Failed to disconnect wallet:", err);
    }
  };

  const handleSwitchChain = async (targetChainId: number) => {
    try {
      await switchChain({ chainId: targetChainId });
      setShowChainMenu(false);
    } catch (err) {
      console.error("Failed to switch chain:", err);
    }
  };

  const getStatusColor = () => {
    if (!isConnected) return "default";
    if (!isOnSupportedChain) return "warning";
    return "success";
  };

  const getStatusText = () => {
    if (isConnecting || isReconnecting) return "Connecting...";
    if (!isConnected) return "Connect Wallet";
    if (!isOnSupportedChain) return "Wrong Network";
    return `${address?.slice(0, 6)}…${address?.slice(-4)}`;
  };

  const WalletButton = () => {
    if (!mounted) {
      return (
        <Button size="sm" variant="flat" isLoading>
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
                size="sm"
                variant="flat"
                color={isOnSupportedChain ? "success" : "warning"}
                isLoading={isSwitchingChain}
                className="min-w-0"
              >
                {currentChainName}
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Chain selection">
              {SUPPORTED_CHAINS.map((chain) => (
                <DropdownItem
                  key={chain.id}
                  onClick={() => handleSwitchChain(chain.id)}
                  className={chainId === chain.id ? "bg-primary/10" : ""}
                >
                  <div className="flex items-center justify-between w-full">
                    <span>{chain.name}</span>
                    {chainId === chain.id && <span className="text-primary">✓</span>}
                  </div>
                </DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>

          {/* Wallet Status Button */}
          <Dropdown>
            <DropdownTrigger>
              <Button
                size="sm"
                variant="flat"
                color={getStatusColor()}
                className="flex items-center gap-2"
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
              size="sm"
              variant="flat"
              color="primary"
              isLoading={isPending || isConnecting}
            >
              {isPending || isConnecting ? "Connecting..." : "Connect Wallet"}
            </Button>
          </DropdownTrigger>
          <DropdownMenu aria-label="Wallet connectors">
            {connectors
              .filter((connector) => connector.name !== "Injected") // Filter out generic injected
              .map((connector) => (
                <DropdownItem
                  key={connector.id}
                  onClick={() => handleConnect(connector)}
                  className="flex items-center gap-2"
                >
                  <span>{connector.name}</span>
                </DropdownItem>
              ))}
            {/* Fallback injected connector */}
            <DropdownItem
              key="injected-fallback"
              onClick={() => handleConnect(injected())}
              className="flex items-center gap-2"
            >
              <span>Browser Wallet</span>
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>

        {/* Removed the error chip from UI - errors are now logged to console */}
      </div>
    );
  };

  const MobileWalletButton = () => {
    if (!mounted) return null;

    return (
      <div className="sm:hidden flex items-center gap-2">
        {isConnected && address ? (
          <div className="flex flex-col items-center gap-2">
            <Button
              size="sm"
              variant="flat"
              color={getStatusColor()}
              onClick={handleDisconnect}
            >
              {getStatusText()}
            </Button>
            {!isOnSupportedChain && (
              <Chip size="sm" color="warning" variant="flat">
                Switch Network
              </Chip>
            )}
          </div>
        ) : (
          <Button
            size="sm"
            variant="flat"
            color="primary"
            onClick={() => setShowWalletMenu(true)}
            isLoading={isPending || isConnecting}
          >
            {isPending || isConnecting ? "Connecting..." : "Connect"}
          </Button>
        )}
      </div>
    );
  };

  return (
    <HeroUINavbar maxWidth="xl" position="sticky" isBordered>
      <NavbarContent className="basis-auto" justify="start">
        <NavbarBrand as="li" className="gap-3 max-w-fit">
          <NextLink href="/" className="flex items-center gap-2">
            <Logo />
            <p className="font-bold">Developer Kit</p>
          </NextLink>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent className="hidden lg:flex flex-1" justify="center">
        <ul className="flex gap-6">
          {siteConfig.navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <NavbarItem key={item.href} isActive={active}>
                <NextLink
                  href={item.href}
                  className={clsx(
                    linkStyles({ color: "foreground" }),
                    "data-[active=true]:text-primary data-[active=true]:font-medium"
                  )}
                  data-active={active}
                >
                  {item.label}
                </NextLink>
              </NavbarItem>
            );
          })}
        </ul>
      </NavbarContent>

      <NavbarContent className="hidden sm:flex items-center gap-3" justify="end">
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
          
          {siteConfig.navMenuItems.map((item, i) => (
            <NavbarMenuItem key={i} className="w-full text-center">
              <NextLink href={item.href} className="text-lg block w-full">
                {item.label}
              </NextLink>
            </NavbarMenuItem>
          ))}

          {/* Connection Status in Mobile Menu */}
          {mounted && isConnected && (
            <div className="w-full p-4 bg-content2 rounded-lg">
              <div className="text-xs text-gray-500 mb-2">Wallet Status</div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-xs">Network:</span>
                  <Chip 
                    size="sm" 
                    color={isOnSupportedChain ? "success" : "warning"}
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

      {/* Removed the global connection error notification - errors are now logged to console */}
    </HeroUINavbar>
  );
};