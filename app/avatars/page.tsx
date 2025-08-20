"use client";

import React, { useEffect, useState } from "react";
import { useAccount } from "wagmi";

import { useCircles } from "../../contexts/CirclesContext";

type AsyncState<T = unknown> = {
  loading?: boolean;
  error?: string;
  result?: T;
};

type ModalState = {
  open: boolean;
  title?: string;
  data?: unknown;
  error?: string | undefined;
};

export default function AvatarsPage() {
  const { address, isConnected } = useAccount();
  const { sdk, isLoading: sdkLoading, error: sdkError } = useCircles();

  const [modal, setModal] = useState<ModalState>({ open: false });
  const openModal = (title: string, data?: unknown, error?: string) =>
    setModal({ open: true, title, data, error });
  const closeModal = () => setModal({ open: false });

  const [avatarInfo, setAvatarInfo] = useState<AsyncState>({});

  const [fullAvatar, setFullAvatar] = useState<AsyncState>({});

  const [profileCU, setProfileCU] = useState<{
    profile: { name: string; description: string };
    state: AsyncState;
  }>({ profile: { name: "", description: "" }, state: {} });

  const [humanV2, setHumanV2] = useState<{
    inviter: string;
    profile: { name: string; description: string };
    state: AsyncState;
  }>({ inviter: "", profile: { name: "", description: "" }, state: {} });

  const [orgV2, setOrgV2] = useState<{
    profile: { name: string; description: string };
    state: AsyncState;
  }>({ profile: { name: "", description: "" }, state: {} });

  const [groupV2, setGroupV2] = useState<{
    mint: string;
    profile: { name: string; description: string; symbol: string };
    state: AsyncState;
  }>({
    mint: "",
    profile: { name: "", description: "", symbol: "" },
    state: {},
  });

  const [canSelfMig, setCanSelfMig] = useState<{
    addr: string;
    state: AsyncState<boolean>;
  }>({ addr: "", state: {} });

  const [migrate, setMigrate] = useState<{
    inviter: string;
    avatar: string;
    profile: { name: string; description: string };
    trust: string;
    state: AsyncState;
  }>({
    inviter: "",
    avatar: "",
    profile: { name: "", description: "" },
    trust: "",
    state: {},
  });

  const [v2Filter, setV2Filter] = useState<string>("");
  const [v2Results, setV2Results] = useState<
    AsyncState<
      {
        address: string;
        type?: string | undefined;
        version?: number | undefined;
      }[]
    >
  >({});

  const run = async <T,>(
    fn: () => Promise<T>,
    setter: (s: AsyncState<T>) => void,
  ) => {
    setter({ loading: true });
    try {
      const result = await fn();

      setter({ loading: false, result });
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : String(e);

      setter({ loading: false, error: errorMessage });
    }
  };

  const safeCsv = (csv: string) =>
    csv
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

  useEffect(() => {
    if (sdk && isConnected && address) {
      run(
        () => sdk.data.getAvatarInfo(address.toLowerCase() as `0x${string}`),
        setAvatarInfo,
      );
    }
  }, [sdk, isConnected, address]);

  /** ------------------------ Guards ------------------------ */
  if (!isConnected) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-900 dark:text-gray-100">
        🔌 Please connect your wallet.
      </div>
    );
  }
  if (sdkLoading) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-900 dark:text-gray-100">
        ⏳ Loading Circles SDK…
      </div>
    );
  }
  if (sdkError) {
    return (
      <div className="flex-1 flex items-center justify-center text-red-500">
        ❗ SDK Error: {sdkError.message}
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <aside className="w-1/4 h-full border-r dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-6 overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6">Circles SDK</h2>
        <nav className="space-y-4 text-sm">
          <a className="block hover:underline" href="#basic-info">
            1. Basic Avatar Info
          </a>
          <a className="block hover:underline" href="#full-avatar">
            2. Full Avatar Interface
          </a>
          <a className="block hover:underline" href="#profile">
            3. Profile (create/update)
          </a>
          <a className="block hover:underline" href="#register-v2">
            4. Register V2 Avatars
          </a>
          <a className="block hover:underline" href="#migrate-check">
            5. Migration Eligibility
          </a>
          <a className="block hover:underline" href="#migrate">
            6. Avatar Migration
          </a>
          <a className="block hover:underline" href="#filter-v2">
            7. Filter V2 Avatars
          </a>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 h-full overflow-y-auto p-8 space-y-16 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        {/* 1. Basic Avatar Info */}
        <section id="basic-info">
          <SectionHeader
            index="1"
            info="sdk.data.getAvatarInfo(address) → returns a small row (or undefined) describing whether an address is an avatar, its type (human | organization | group) and protocol version (1 or 2)."
            title="Basic Avatar Info"
          />
          <Code>{`const info = await sdk.data.getAvatarInfo("${address?.toLowerCase()}");`}</Code>
          <button
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={() =>
              address &&
              sdk &&
              run(
                () =>
                  sdk.data.getAvatarInfo(
                    address.toLowerCase() as `0x${string}`,
                  ),
                setAvatarInfo,
              )
            }
          >
            Refresh Info
          </button>
          <Result
            state={avatarInfo}
            title="Basic Avatar Info"
            onOpen={openModal}
          />
        </section>

        {/* 2. Full Avatar Interface */}
        <section id="full-avatar">
          <SectionHeader
            index="2"
            info="sdk.getAvatar(address) → returns an AvatarInterface object with helpers (trust ops, balances, profile ops, transfers, etc.)."
            title="Full Avatar Interface"
          />
          <Code>{`const avatar = await sdk.getAvatar("${address?.toLowerCase()}");\nconsole.log(Object.keys(avatar));`}</Code>
          <button
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={() =>
              address &&
              sdk &&
              run(
                () => sdk.getAvatar(address.toLowerCase() as `0x${string}`),
                setFullAvatar,
              )
            }
          >
            Load Avatar
          </button>
          {fullAvatar.result != null && (
            <button
              className="ml-2 mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={() =>
                openModal(
                  "Avatar Interface Keys",
                  Object.keys(fullAvatar.result as Record<string, unknown>),
                )
              }
            >
              View Keys
            </button>
          )}
          <Result
            hideInline
            state={fullAvatar}
            title="Avatar Interface"
            onOpen={openModal}
          />
        </section>

        {/* 3. Profile create/update */}
        <section id="profile">
          <SectionHeader
            index="3"
            info="sdk.createOrUpdateProfile(profile) → upserts an avatar's profile (name, description, image, etc. depending on your SDK version)."
            title="Profile (createOrUpdateProfile)"
          />
          <Code>{`await sdk.createOrUpdateProfile({ name, description });`}</Code>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="Name"
              value={profileCU.profile.name}
              onChange={(v) =>
                setProfileCU({
                  ...profileCU,
                  profile: { ...profileCU.profile, name: v },
                })
              }
            />
            <Input
              placeholder="Description"
              value={profileCU.profile.description}
              onChange={(v) =>
                setProfileCU({
                  ...profileCU,
                  profile: { ...profileCU.profile, description: v },
                })
              }
            />
          </div>
          <button
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={() =>
              sdk &&
              run(
                () => sdk.createOrUpdateProfile(profileCU.profile),
                (s) => setProfileCU({ ...profileCU, state: s }),
              )
            }
          >
            Create/Update Profile
          </button>
          <Result
            state={profileCU.state}
            title="Create/Update Profile"
            onOpen={openModal}
          />
        </section>

        {/* 4. Register V2 */}
        <section id="register-v2">
          <SectionHeader
            index="4"
            info="V2 uses an invitation system for human signups (sdk.acceptInvitation), plus org & group specific methods."
            title="Register V2 Avatars"
          />

          {/* 4.1 Human V2 via invitation */}
          <SubHeader
            info="sdk.acceptInvitation(inviter, profile) → signs the connected wallet up as a human on Circles V2."
            title="4.1 Human V2 (acceptInvitation)"
          />
          <Code>{`await sdk.acceptInvitation(inviter, { name, description });`}</Code>
          <Input
            placeholder="Inviter Address"
            value={humanV2.inviter}
            onChange={(v) => setHumanV2({ ...humanV2, inviter: v })}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="Name"
              value={humanV2.profile.name}
              onChange={(v) =>
                setHumanV2({
                  ...humanV2,
                  profile: { ...humanV2.profile, name: v },
                })
              }
            />
            <Input
              placeholder="Description"
              value={humanV2.profile.description}
              onChange={(v) =>
                setHumanV2({
                  ...humanV2,
                  profile: { ...humanV2.profile, description: v },
                })
              }
            />
          </div>
          <button
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={() =>
              sdk &&
              run(
                () =>
                  sdk.acceptInvitation(
                    humanV2.inviter.trim().toLowerCase() as `0x${string}`,
                    humanV2.profile,
                  ),
                (s) => setHumanV2({ ...humanV2, state: s }),
              )
            }
          >
            Accept Invitation (Human V2)
          </button>
          <Result
            state={humanV2.state}
            title="Human V2 Registration"
            onOpen={openModal}
          />

          {/* 4.2 Organization V2 */}
          <SubHeader
            noTopMargin
            info="sdk.registerOrganizationV2(profile) → registers an organization on V2."
            title="4.2 Organization V2"
          />
          <Code>{`await sdk.registerOrganizationV2({ name, description });`}</Code>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="Name"
              value={orgV2.profile.name}
              onChange={(v) =>
                setOrgV2({ ...orgV2, profile: { ...orgV2.profile, name: v } })
              }
            />
            <Input
              placeholder="Description"
              value={orgV2.profile.description}
              onChange={(v) =>
                setOrgV2({
                  ...orgV2,
                  profile: { ...orgV2.profile, description: v },
                })
              }
            />
          </div>
          <button
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={() =>
              sdk &&
              run(
                () => sdk.registerOrganizationV2(orgV2.profile),
                (s) => setOrgV2({ ...orgV2, state: s }),
              )
            }
          >
            Register Org V2
          </button>
          <Result
            state={orgV2.state}
            title="Organization V2 Registration"
            onOpen={openModal}
          />

          {/* 4.3 Group V2 */}
          <SubHeader
            noTopMargin
            info="sdk.registerGroupV2(mint, groupProfile) → registers a group avatar."
            title="4.3 Group V2"
          />
          <Code>{`await sdk.registerGroupV2("mintAddress", { name, description, symbol });`}</Code>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input
              placeholder="Mint Address"
              value={groupV2.mint}
              onChange={(v) => setGroupV2({ ...groupV2, mint: v })}
            />
            <Input
              placeholder="Name"
              value={groupV2.profile.name}
              onChange={(v) =>
                setGroupV2({
                  ...groupV2,
                  profile: { ...groupV2.profile, name: v },
                })
              }
            />
            <Input
              placeholder="Description"
              value={groupV2.profile.description}
              onChange={(v) =>
                setGroupV2({
                  ...groupV2,
                  profile: { ...groupV2.profile, description: v },
                })
              }
            />
            <Input
              placeholder="Symbol"
              value={groupV2.profile.symbol}
              onChange={(v) =>
                setGroupV2({
                  ...groupV2,
                  profile: { ...groupV2.profile, symbol: v },
                })
              }
            />
          </div>
          <button
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={() =>
              sdk &&
              run(
                () =>
                  sdk.registerGroupV2(
                    groupV2.mint.trim().toLowerCase() as `0x${string}`,
                    groupV2.profile,
                  ),
                (s) => setGroupV2({ ...groupV2, state: s }),
              )
            }
          >
            Register Group V2
          </button>
          <Result
            state={groupV2.state}
            title="Group V2 Registration"
            onOpen={openModal}
          />
        </section>

        {/* 5. Migration eligibility */}
        <section id="migrate-check">
          <SectionHeader
            index="5"
            info="sdk.canSelfMigrate(address) → returns true/false if an avatar can migrate itself to V2 without an external inviter."
            title="Migration Eligibility (canSelfMigrate)"
          />
          <Code>{`const eligible = await sdk.canSelfMigrate("${address?.toLowerCase()}");`}</Code>
          <Input
            placeholder="Address to check (defaults to connected)"
            value={canSelfMig.addr}
            onChange={(v) => setCanSelfMig({ ...canSelfMig, addr: v })}
          />
          <button
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={() => {
              const target = (
                canSelfMig.addr?.trim() ||
                address ||
                ""
              ).toLowerCase();

              if (!target) {
                setCanSelfMig({
                  ...canSelfMig,
                  state: { error: "No address to check" },
                });

                return;
              }

              if (!sdk) {
                setCanSelfMig({
                  ...canSelfMig,
                  state: { error: "SDK not available" },
                });

                return;
              }

              // Note: canSelfMigrate might need different parameter type
              // Temporarily disabled until SDK types are clarified
              setCanSelfMig({
                ...canSelfMig,
                state: {
                  error:
                    "canSelfMigrate temporarily disabled due to type issues",
                },
              });
            }}
          >
            Check
          </button>
          <Result
            state={canSelfMig.state}
            title="Migration Eligibility"
            onOpen={openModal}
          />
        </section>

        {/* 6. Migrate avatar */}
        <section id="migrate">
          <SectionHeader
            index="6"
            info="sdk.migrateAvatar(inviter, avatar, profile, trust[]) → migrate a V1 avatar to V2 with trust graph and profile."
            title="Avatar Migration (V1 → V2)"
          />
          <Code>{`await sdk.migrateAvatar(inviter, avatar, { name, description }, ["trust1","trust2"]);`}</Code>
          <Input
            placeholder="Inviter Address"
            value={migrate.inviter}
            onChange={(v) => setMigrate({ ...migrate, inviter: v })}
          />
          <Input
            placeholder="Avatar (to migrate)"
            value={migrate.avatar}
            onChange={(v) => setMigrate({ ...migrate, avatar: v })}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="Name"
              value={migrate.profile.name}
              onChange={(v) =>
                setMigrate({
                  ...migrate,
                  profile: { ...migrate.profile, name: v },
                })
              }
            />
            <Input
              placeholder="Description"
              value={migrate.profile.description}
              onChange={(v) =>
                setMigrate({
                  ...migrate,
                  profile: { ...migrate.profile, description: v },
                })
              }
            />
          </div>
          <Input
            placeholder="Trust Addresses (comma separated)"
            value={migrate.trust}
            onChange={(v) => setMigrate({ ...migrate, trust: v })}
          />
          <button
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={() =>
              sdk &&
              run(
                () =>
                  sdk.migrateAvatar(
                    migrate.inviter.trim().toLowerCase() as `0x${string}`,
                    migrate.avatar.trim().toLowerCase() as `0x${string}`,
                    migrate.profile,
                    safeCsv(migrate.trust),
                  ),
                (s) => setMigrate({ ...migrate, state: s }),
              )
            }
          >
            Migrate Avatar
          </button>
          <Result
            state={migrate.state}
            title="Avatar Migration"
            onOpen={openModal}
          />
        </section>

        {/* 7. Filter V2 Avatars */}
        <section id="filter-v2">
          <SectionHeader
            index="7"
            info="Paste a comma-separated list of addresses to get only those which are V2 avatars."
            title="Filter V2 Avatars"
          />
          <Code>{`const addrs = safeCsv(v2Filter);\nconst infos = await Promise.all(addrs.map(async (addr) => ({ address: addr, ...(await sdk.data.getAvatarInfo(addr) || {}) })));\nconst v2Only = infos.filter((r) => r.version === 2);`}</Code>
          <Input
            placeholder="Comma separated addresses"
            value={v2Filter}
            onChange={(v) => setV2Filter(v)}
          />
          <button
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={() =>
              sdk &&
              run(async () => {
                const infos = await Promise.all(
                  safeCsv(v2Filter).map(async (addr) => {
                    const info = await sdk.data.getAvatarInfo(
                      addr as `0x${string}`,
                    );

                    return {
                      address: addr,
                      type: info?.type as string | undefined,
                      version: info?.version as number | undefined,
                    };
                  }),
                );

                return infos.filter((r) => r.version === 2);
              }, setV2Results)
            }
          >
            Filter V2 Avatars
          </button>
          <Result state={v2Results} title="V2 Avatars" onOpen={openModal} />
        </section>
      </main>

      <Modal
        open={modal.open}
        {...(modal.title !== undefined && { title: modal.title })}
        onClose={closeModal}
      >
        {modal.error && (
          <p className="text-red-500 text-sm mb-2">Error: {modal.error}</p>
        )}
        {modal.data !== undefined ? (
          <pre className="text-xs whitespace-pre-wrap break-words">
            {typeof modal.data === "string"
              ? modal.data
              : JSON.stringify(modal.data, null, 2)}
          </pre>
        ) : (
          !modal.error && <p className="text-sm italic">No data</p>
        )}
      </Modal>
    </div>
  );
}

function SectionHeader({
  index,
  title,
  info,
}: {
  index: string;
  title: string;
  info: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <h2 className="text-3xl font-semibold">
        {index}. {title}
      </h2>
      <InfoButton description={info} />
    </div>
  );
}

function SubHeader({
  title,
  info,
  noTopMargin,
}: {
  title: string;
  info: string;
  noTopMargin?: boolean;
}) {
  return (
    <div className={`${noTopMargin ? "" : "mt-8"} flex items-start gap-2`}>
      <h3 className="text-2xl font-semibold">{title}</h3>
      <InfoButton description={info} />
    </div>
  );
}

function Result({
  state,
  hideInline,
  title,
  onOpen,
}: {
  state: AsyncState;
  hideInline?: boolean;
  title: string;
  onOpen: (title: string, data?: unknown, error?: string) => void;
}) {
  if (!state.loading && !state.error && state.result === undefined) return null;

  return (
    <div className="mt-3 flex items-start gap-3">
      {state.loading && <p>Loading…</p>}

      {state.error && (
        <div className="flex items-center gap-2">
          <p className="text-red-500">Error: {state.error}</p>
          <button
            className="px-3 py-1 text-xs rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
            onClick={() => onOpen(`${title} (Error)`, undefined, state.error)}
          >
            Open in modal
          </button>
        </div>
      )}

      {state.result !== undefined && (
        <div className="flex items-start gap-2 w-full">
          {!hideInline && (
            <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded text-xs overflow-auto max-h-48 w-full">
              {JSON.stringify(state.result, null, 2)}
            </pre>
          )}
          <button
            className="px-3 py-1 text-xs rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
            onClick={() => onOpen(title, state.result)}
          >
            Open result in modal
          </button>
        </div>
      )}
    </div>
  );
}

function Input({
  placeholder,
  value,
  onChange,
}: {
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <input
      className="w-full p-2 mt-2 border rounded bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

function Code({ children }: { children: string }) {
  return (
    <pre className="mt-2 bg-gray-200 dark:bg-gray-800 p-4 rounded overflow-auto text-sm">
      {children}
    </pre>
  );
}

function InfoButton({ description }: { description: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        aria-label="info"
        className="mt-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        type="button"
        onClick={() => setOpen((o) => !o)}
      >
        <InfoIcon className="w-5 h-5" />
      </button>
      {open && (
        <div className="absolute z-30 mt-1 w-96 max-w-[90vw] p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded shadow-lg text-xs leading-5 text-gray-800 dark:text-gray-100">
          {description}
        </div>
      )}
    </div>
  );
}

function InfoIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" {...props}>
      <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9 9a1 1 0 012 0v5a1 1 0 11-2 0V9zm2-4a1 1 0 10-2 0 1 1 0 002 0z" />
    </svg>
  );
}

function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children?: React.ReactNode;
}) {
  if (!open) return null;

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50"
      role="dialog"
    >
      <div className="relative w-full max-w-3xl max-h-[85vh] overflow-hidden rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b dark:border-gray-700">
          <h4 className="font-semibold text-lg truncate">
            {title ?? "Result"}
          </h4>
          <button
            aria-label="Close modal"
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-4 overflow-auto max-h-[70vh]">{children}</div>

        {/* Footer */}
        <div className="px-4 py-3 border-t dark:border-gray-700 flex justify-end">
          <button
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
