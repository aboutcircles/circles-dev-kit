import "@/styles/globals.css";
import type { Metadata, Viewport } from "next";
import clsx from "clsx";
import NextLink from "next/link";

import { Providers } from "./providers";
import { CirclesProvider } from "../contexts/CirclesContext";
import { siteConfig } from "@/config/site";
import { fontSans } from "@/config/fonts";
import { Navbar } from "@/components/navbar";

function getBaseUrl() {
  const candidate = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return /^https?:\/\//.test(candidate) ? candidate : `https://${candidate}`;
}

const baseUrl = getBaseUrl();

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: siteConfig.name,
    template: `%s – ${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: { icon: "/favicon.ico" },
  openGraph: {
    type: "website",
    url: baseUrl,
    title: siteConfig.name,
    description: siteConfig.description,
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: `${siteConfig.name} Open Graph Image`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: siteConfig.links.twitter,
    title: siteConfig.name,
    description: siteConfig.description,
    images: ["/og.png"],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const year = new Date().getFullYear();

  return (
    <html suppressHydrationWarning lang="en">
      <body
        className={clsx(
          "min-h-screen text-foreground bg-background font-sans antialiased",
          fontSans.variable
        )}
      >
        <Providers themeProps={{ attribute: "class", defaultTheme: "dark" }}>
          <CirclesProvider>
            <div className="relative flex min-h-screen flex-col">
              <Navbar />

              <main className="container mx-auto max-w-7xl flex-grow px-6 pt-16">
                {children}
              </main>

              <footer className="w-full py-6">
                <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 text-sm text-default-600 md:flex-row">
                  <p>© {year} {siteConfig.name} • Built for the Circles ecosystem</p>
                  <div className="flex items-center gap-4">
                    <NextLink href={siteConfig.links.docs} className="hover:text-primary">
                      Docs
                    </NextLink>
                    <NextLink
                      href={siteConfig.links.github}
                      className="hover:text-primary"
                      aria-label="GitHub repository"
                    >
                      GitHub
                    </NextLink>
                    <NextLink href="https://aboutcircles.com" className="hover:text-primary">
                      aboutcircles.com
                    </NextLink>
                  </div>
                </div>
              </footer>
            </div>
          </CirclesProvider>
        </Providers>
      </body>
    </html>
  );
}