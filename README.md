# Circles Dev Kit 

A hands-on learning repository for developers to **explore, understand, and build with the Circles SDK**.  
This app focuses on practical, clickable examples—so you can connect a wallet and immediately try avatar/profile operations, trust graph actions, group mechanics, and JSON‑RPC queries against Circles endpoints.

---

## What’s inside

### 1) Avatars Lab (`/avatars`)
- Discover: `sdk.data.getAvatarInfo(address)`
- Avatar interface: `sdk.getAvatar(address)` (trust ops, balances, profile ops, transfers)
- Profile upsert: `sdk.createOrUpdateProfile({ name, description })`
- Human V2 (invitation): `sdk.acceptInvitation(inviter, profile)`
- Organization V2: `sdk.registerOrganizationV2(profile)`
- Group V2 (register): `sdk.registerGroupV2(mint, profile)`
- Migration eligibility: `sdk.canSelfMigrate(address)`
- Migrate V1 → V2: `sdk.migrateAvatar(inviter, avatar, profile, trustAddrs[])`
- Filter V2 avatars: for a list of addresses via `sdk.data.getAvatarInfo`

### 2) JSON‑RPC Explorer (`/explorer`)
Ready-made, copyable JSON payloads for Circles’ public RPC endpoints:
- `circles_getTotalBalance`
- `circlesV2_getTotalBalance`
- `circles_getTokenBalances`
- `circles_getBalanceBreakdown`
- `circles_getTrustRelations`
- `circles_getCommonTrust`
- `circlesV2_findPath`
- `circles_events`
- `circles_health`
- `circles_tables`

Each card shows:
- One-click POST to the endpoint
- The exact request body used
- The raw JSON response in a modal

> Note: This uses `https://rpc.aboutcircles.com/*` endpoints directly from the client for simplicity while learning.

### 3) Groups Lab (`/groups`)
- Register groups
  - Core Members Group (CMG) via `sdk.coreMembersGroupDeployer.deployGroup(name, symbol, description)`
  - Base Group via `sdk.baseGroupFactory.deployBaseGroup(mint, name, symbol, description)`
- Inspect groups
  - Owner/Service/MintHandler, membership conditions, token info, balances
- Discover & search
  - `sdk.data.findGroups(limit, { nameStartsWith, symbolStartsWith, ownerEquals, groupTypeIn })`
  - `sdk.data.getGroupMemberships(avatar, limit)` (with paging)
- Events
  - `sdk.data.getEvents(group, fromBlock?, toBlock?, eventTypes?)`
- Treasury
  - `sdk.v2Hub.treasuries(groupAddr)` + `sdk.data.getTokenBalances(treasury)`
- Trust graph
  - `sdk.data.getAggregatedTrustRelations(groupAddr, depth)`
- Balances
  - `sdk.data.getTotalBalanceV2(addr, includeZero)` + `sdk.data.getTokenBalances(addr)`
- Operations
  - `avatar.trust(addresses[], expiry?)`, `avatar.untrust(addresses[])`
  - `avatar.groupMint(group, collateral[], amounts[], data)`
  - `avatar.groupRedeem(group, collateral[], amounts[])`
  - `avatar.groupRedeemAuto(group, amount)`
  - Admin: `avatar.setOwner(newOwner)`, `avatar.setService(newService)`, `avatar.setMembershipCondition(condition, enabled)`

---

## Prerequisites

- Node.js 18+
- A browser wallet (e.g., MetaMask)
- Gnosis Chain account with a small amount of xDAI for gas (for on‑chain actions)
- Optional: a valid inviter address for Human V2 registration flows

---

## Quick start

```
 npx create-circles-dev-kit@latest
```

## Building from repo

```bash
git clone https://github.com/aboutcircles/circles-dev-kit
npm install
pnpm dev
# open http://localhost:3000
```

> The app uses a `CirclesContext` that wires your Circles SDK instance. Ensure it uses the same chain/RPC (or a custom provider) you intend to use.

---

## Architecture overview

```
app/
  avatars/page.tsx     → Avatars Lab (profiles, V2 registration, migration, filters)
  explorer/page.tsx    → JSON-RPC Explorer (cards & modals for RPC calls)
  groups/page.tsx      → Groups Lab (registration, discovery, ops, admin)
contexts/
  CirclesContext.tsx   → Provides { sdk, isLoading, error } to pages
components/
  (inline UI in pages: Modal, Result, Input, InfoButton, SectionHeader)
```

- `AsyncState` pattern (`loading`, `error`, `result`) standardizes UX across actions.
- A small `run(fn, setter)` helper wraps calls, updates UI, and captures errors.
- Addresses are lower‑cased before calls to avoid checksum/casing issues.



## Extending the playground

- **Add a new SDK example**
  1. Pick a page (e.g., `/avatars`) and add a new state bucket `{ input..., state: AsyncState }`.
  2. Add UI inputs + a button that calls `run(() => sdk.yourMethod(...), setState)`.
  3. Display with the shared `<Result />` component.

- **Add a new RPC card**
  1. Open `/explorer` and extend the `rpcMethods` array with `{ key, title, description, url, method, getParams }`.
  2. The UI will auto‑render a card with **Code** and **Result** actions.

---


## Tips & gotchas

- **Network**: Many actions require Gnosis Chain. Switch your wallet network accordingly.
- **Gas**: On‑chain actions (register, trust, mint/redeem, admin) need xDAI.
- **Invitations**: Human V2 registration requires a valid inviter.

