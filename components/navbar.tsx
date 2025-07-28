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
import NextLink from "next/link";
import clsx from "clsx";
import { usePathname } from "next/navigation";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { injected } from "wagmi/connectors";
import { siteConfig } from "@/config/site";
import { ThemeSwitch } from "@/components/theme-switch";
import { GithubIcon, Logo } from "@/components/icons";

export const Navbar: React.FC = () => {
  const pathname = usePathname();

  const { address, isConnected } = useAccount();
  const { connect } = useConnect({ connector: injected() });
  const { disconnect } = useDisconnect();

  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

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
          {mounted && (
            isConnected && address ? (
              <Button size="sm" variant="flat" onClick={() => disconnect()}>
                {`${address.slice(0, 6)}…${address.slice(-4)}`}
              </Button>
            ) : (
              <Button size="sm" variant="flat" onClick={() => connect()}>
                Connect Wallet
              </Button>
            )
          )}
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
        <div className="mx-4 mt-4 flex flex-col items-center gap-3">
          {siteConfig.navMenuItems.map((item, i) => (
            <NavbarMenuItem key={i} className="w-full text-center">
              <NextLink href={item.href} className="text-lg block w-full">
                {item.label}
              </NextLink>
            </NavbarMenuItem>
          ))}
        </div>
      </NavbarMenu>
    </HeroUINavbar>
  );
};