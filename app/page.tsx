"use client";

import { Link } from "@heroui/link";
import { Snippet } from "@heroui/snippet";
import { Code } from "@heroui/code";
import { button as buttonStyles } from "@heroui/theme";

import { title, subtitle } from "@/components/primitives";
import { GithubIcon } from "@/components/icons";
import { siteConfig } from "@/config/site";

type Feature = {
  id: string;
  name: string;
  blurb: string;
  docPath: string;
  comingSoon?: boolean;
};

const FEATURES: Feature[] = [
  {
    id: "profiles",
    name: "Profiles & Identity",
    blurb:
      "Query and render Circles user/org profiles (names, avatars, bios) with @circles-sdk/profiles.",
    docPath: "/docs/profiles",
  },
  {
    id: "balances",
    name: "Balances & Transfers",
    blurb:
      "Read CRC balances across V1/V2 tokens and send trustless payments using @circles-sdk/sdk.",
    docPath: "/docs/balances",
  },
  {
    id: "trust-graph",
    name: "Trust Graph Tools",
    blurb:
      "Inspect, visualize and mutate trust links. Build routing UX on top of the graph.",
    docPath: "/docs/trust",
  },
  {
    id: "pathfinder",
    name: "Pathfinder / Routing",
    blurb:
      "Find payment paths through multi-hop trust edges. Includes wrapped-token awareness.",
    docPath: "/docs/pathfinder",
  },
  {
    id: "qr-pay",
    name: "QR Pay & Request Links",
    blurb:
      "Generate scannable requests for CRC. Perfect for PoS and mobile-first flows.",
    docPath: "/docs/qr",
  },
  {
    id: "org-tools",
    name: "Org Tools & Treasury",
    blurb:
      "Manage org accounts, permissions, and bulk payouts with helper utilities.",
    docPath: "/docs/orgs",
    comingSoon: true,
  },
];

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="flex flex-col items-center justify-center gap-6 py-14 px-4 text-center">
        <div className="inline-block max-w-3xl">
          <span className={title()}>Circles Kit&nbsp;</span>
          <span className={title({ color: "violet" })}>Developer Tooling</span>
          <br />
          <span className={title()}>Build apps on top of Circles - fast.</span>

          <div className={subtitle({ class: "mt-5" })}>
            A collection of React UI pieces, SDK helpers and examples that
            showcase the core features of the Circles ecosystem.
          </div>
        </div>

        <div className="flex gap-3 flex-wrap justify-center">
          <Link
            href='/avatars'
            className={buttonStyles({
              color: "primary",
              radius: "full",
              variant: "shadow",
            })}
          >
            Get Started
          </Link>
          <Link
            href={siteConfig.links.github}
            className={buttonStyles({ variant: "bordered", radius: "full" })}
            isExternal
          >
            <GithubIcon size={20} />
            GitHub
          </Link>
        </div>

        {/* Quick start snippet */}
        <Snippet hideCopyButton={false} hideSymbol variant="bordered" className="mt-8">
          <span>
            <Code color="primary">
              npx create-circles-kit@latest
            </Code>
          </span>
        </Snippet>
      </section>

      {/* Feature Grid */}
      <section className="max-w-5xl mx-auto px-4 pb-24">
        <h2 className="text-2xl font-semibold mb-6">What’s inside?</h2>

        <div className="grid gap-6 md:grid-cols-2">
          {FEATURES.map((f) => (
            <FeatureCard key={f.id} feature={f} />
          ))}
        </div>
      </section>
    </>
  );
}

/* -------------------------- Helpers -------------------------- */

function FeatureCard({ feature }: { feature: Feature }) {
  return (
    <div className="border border-default-200/60 rounded-2xl p-6 flex flex-col gap-3 text-left">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        {feature.name}
        {feature.comingSoon && (
          <span className="text-xs bg-default-200 px-2 py-0.5 rounded-full">soon</span>
        )}
      </h3>
      <p className="text-sm text-default-600 leading-5">{feature.blurb}</p>

      <div className="mt-auto pt-3">
        <Link
          href={feature.docPath}
          className={buttonStyles({
            size: "sm",
            radius: "full",
            variant: "light",
            color: "primary",
          })}
        >
          Learn more →
        </Link>
      </div>
    </div>
  );
}