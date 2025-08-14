"use client";


import React, { useContext, useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { CirclesContext } from "../../contexts/CirclesContext";

type AsyncState<T = any> = {
  loading?: boolean;
  error?: string;
  result?: T;
};

type ModalState = {
  open: boolean;
  title?: string;
  data?: any;
  error?: string;
};

export default function GroupsPage() {
  const { address, isConnected } = useAccount();
  const { sdk, isLoading: sdkLoading, error: sdkError } = useContext(CirclesContext);

  const [modal, setModal] = useState<ModalState>({ open: false });
  const openModal = (title: string, data?: any, error?: string) =>
    setModal({ open: true, title, data, error });
  const closeModal = () => setModal({ open: false });

  // Group Registration
  const [registerCMG, setRegisterCMG] = useState<{
    profile: { name: string; description: string; symbol: string };
    state: AsyncState;
  }>({ profile: { name: "", description: "", symbol: "" }, state: {} });

  const [registerBaseGroup, setRegisterBaseGroup] = useState<{
    mint: string;
    profile: { name: string; description: string; symbol: string };
    state: AsyncState;
  }>({ mint: "", profile: { name: "", description: "", symbol: "" }, state: {} });

  // Group Management
  const [groupAddress, setGroupAddress] = useState<string>("");
  const [groupInfo, setGroupInfo] = useState<AsyncState>({});
  const [groupOwner, setGroupOwner] = useState<AsyncState>({});
  const [groupService, setGroupService] = useState<AsyncState>({});
  const [groupMintHandler, setGroupMintHandler] = useState<AsyncState>({});
  const [membershipConditions, setMembershipConditions] = useState<AsyncState>({});

  // Group Operations
  const [trustOperation, setTrustOperation] = useState<{
    avatars: string;
    expiry: string;
    state: AsyncState;
  }>({ avatars: "", expiry: "", state: {} });

  const [groupMintOp, setGroupMintOp] = useState<{
    group: string;
    collateral: string;
    amounts: string;
    state: AsyncState;
  }>({ group: "", collateral: "", amounts: "", state: {} });

  const [groupRedeemOp, setGroupRedeemOp] = useState<{
    group: string;
    collateral: string;
    amounts: string;
    state: AsyncState;
  }>({ group: "", collateral: "", amounts: "", state: {} });

  const [autoRedeemOp, setAutoRedeemOp] = useState<{
    group: string;
    amount: string;
    state: AsyncState;
  }>({ group: "", amount: "", state: {} });

  // Group Administration
  const [setOwnerOp, setSetOwnerOp] = useState<{
    newOwner: string;
    state: AsyncState;
  }>({ newOwner: "", state: {} });

  const [setServiceOp, setSetServiceOp] = useState<{
    newService: string;
    state: AsyncState;
  }>({ newService: "", state: {} });

  const [membershipConditionOp, setMembershipConditionOp] = useState<{
    condition: string;
    enabled: boolean;
    state: AsyncState;
  }>({ condition: "", enabled: true, state: {} });

  // Group Discovery & Search
  const [groupSearch, setGroupSearch] = useState<{
    params: {
      nameStartsWith: string;
      symbolStartsWith: string;
      ownerEquals: string;
      groupType: string;
    };
    state: AsyncState;
  }>({ 
    params: { nameStartsWith: "", symbolStartsWith: "", ownerEquals: "", groupType: "" }, 
    state: {} 
  });

  // Group Memberships
  const [groupMemberships, setGroupMemberships] = useState<{
    avatarAddress: string;
    state: AsyncState;
  }>({ avatarAddress: "", state: {} });

  // Group Token Info
  const [tokenInfo, setTokenInfo] = useState<{
    tokenAddress: string;
    state: AsyncState;
  }>({ tokenAddress: "", state: {} });

  // Group Events
  const [groupEvents, setGroupEvents] = useState<{
    groupAddress: string;
    fromBlock: string;
    toBlock: string;
    eventTypes: string;
    state: AsyncState;
  }>({ groupAddress: "", fromBlock: "", toBlock: "", eventTypes: "", state: {} });

  // Group Treasury Info
  const [treasuryInfo, setTreasuryInfo] = useState<{
    groupAddress: string;
    state: AsyncState;
  }>({ groupAddress: "", state: {} });

  // Trust Relations for Groups
  const [groupTrustRelations, setGroupTrustRelations] = useState<{
    groupAddress: string;
    state: AsyncState;
  }>({ groupAddress: "", state: {} });

  // Group Balance Info
  const [groupBalance, setGroupBalance] = useState<{
    groupAddress: string;
    state: AsyncState;
  }>({ groupAddress: "", state: {} });

  const run = async <T,>(fn: () => Promise<T>, setter: (s: AsyncState<T>) => void) => {
    setter({ loading: true });
    try {
      const result = await fn();
      setter({ loading: false, result });
    } catch (e: any) {
      setter({ loading: false, error: e?.message ?? String(e) });
    }
  };

  const safeCsv = (csv: string) =>
    csv
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

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
        <h2 className="text-2xl font-bold mb-6">Circles Groups</h2>
        <nav className="space-y-4 text-sm">
          <a href="#register-groups" className="block hover:underline">
            1. Register Groups
          </a>
          <a href="#group-info" className="block hover:underline">
            2. Group Information
          </a>
          <a href="#group-discovery" className="block hover:underline">
            3. Group Discovery
          </a>
          <a href="#group-data" className="block hover:underline">
            4. Group Data & Analytics
          </a>
          <a href="#group-operations" className="block hover:underline">
            5. Group Operations
          </a>
          <a href="#group-admin" className="block hover:underline">
            6. Group Administration
          </a>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 h-full overflow-y-auto p-8 space-y-16 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        
        {/* 1. Register Groups */}
        <section id="register-groups">
          <SectionHeader
            index="1"
            title="Register Groups"
            info="Create different types of groups in Circles V2. Core Members Groups and Base Groups have different capabilities and use cases."
          />

          {/* 1.1 Core Members Group */}
          <SubHeader
            title="1.1 Core Members Group"
            info="Create a Core Members Group with advanced governance features and customizable mint/redemption handlers."
          />
          <Code>{`await sdk.coreMembersGroupDeployer?.deployGroup({ name, description, symbol });`}</Code>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              placeholder="Group Name"
              value={registerCMG.profile.name}
              onChange={(v) =>
                setRegisterCMG({
                  ...registerCMG,
                  profile: { ...registerCMG.profile, name: v }
                })
              }
            />
            <Input
              placeholder="Description"
              value={registerCMG.profile.description}
              onChange={(v) =>
                setRegisterCMG({
                  ...registerCMG,
                  profile: { ...registerCMG.profile, description: v }
                })
              }
            />
            <Input
              placeholder="Symbol"
              value={registerCMG.profile.symbol}
              onChange={(v) =>
                setRegisterCMG({
                  ...registerCMG,
                  profile: { ...registerCMG.profile, symbol: v }
                })
              }
            />
          </div>
          <button
            onClick={() =>
              run(
                () => {
                  if (!sdk.coreMembersGroupDeployer) {
                    throw new Error('Core Members Group deployer not available');
                  }
                  return sdk.coreMembersGroupDeployer.deployGroup(
                    registerCMG.profile.name,
                    registerCMG.profile.symbol,
                    registerCMG.profile.description
                  );
                },
                (s) => setRegisterCMG({ ...registerCMG, state: s })
              )
            }
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Deploy Core Members Group
          </button>
          <Result
            state={registerCMG.state}
            title="Core Members Group Registration"
            onOpen={openModal}
          />

          {/* 1.2 Base Group */}
          <SubHeader
            title="1.2 Base Group"
            info="Create a Base Group using the Base Group Factory with standard mint policies."
            noTopMargin
          />
          <Code>{`await sdk.baseGroupFactory?.deployBaseGroup(mint, { name, description, symbol });`}</Code>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="Mint Policy Address"
              value={registerBaseGroup.mint}
              onChange={(v) => setRegisterBaseGroup({ ...registerBaseGroup, mint: v })}
            />
            <Input
              placeholder="Group Name"
              value={registerBaseGroup.profile.name}
              onChange={(v) =>
                setRegisterBaseGroup({
                  ...registerBaseGroup,
                  profile: { ...registerBaseGroup.profile, name: v }
                })
              }
            />
            <Input
              placeholder="Description"
              value={registerBaseGroup.profile.description}
              onChange={(v) =>
                setRegisterBaseGroup({
                  ...registerBaseGroup,
                  profile: { ...registerBaseGroup.profile, description: v }
                })
              }
            />
            <Input
              placeholder="Symbol"
              value={registerBaseGroup.profile.symbol}
              onChange={(v) =>
                setRegisterBaseGroup({
                  ...registerBaseGroup,
                  profile: { ...registerBaseGroup.profile, symbol: v }
                })
              }
            />
          </div>
          <button
            onClick={() =>
              run(
                () => {
                  if (!sdk.baseGroupFactory) {
                    throw new Error('Base Group factory not available');
                  }
                  return sdk.baseGroupFactory.deployBaseGroup(
                    registerBaseGroup.mint.trim(),
                    registerBaseGroup.profile.name,
                    registerBaseGroup.profile.symbol,
                    registerBaseGroup.profile.description
                  );
                },
                (s) => setRegisterBaseGroup({ ...registerBaseGroup, state: s })
              )
            }
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Deploy Base Group
          </button>
          <Result
            state={registerBaseGroup.state}
            title="Base Group Registration"
            onOpen={openModal}
          />
        </section>

        {/* 2. Group Information */}
        <section id="group-info">
          <SectionHeader
            index="2"
            title="Group Information"
            info="Query information about existing groups including owner, handlers, and membership conditions."
          />
          
          <Input
            placeholder="Group Address"
            value={groupAddress}
            onChange={(v) => setGroupAddress(v)}
          />
          
          <div className="flex gap-2 mt-4 flex-wrap">
            <button
              onClick={() =>
                run(() => sdk.data.getAvatarInfo(groupAddress.trim().toLowerCase()), setGroupInfo)
              }
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Get Group Info
            </button>
            <button
              onClick={async () => {
                const avatar = await sdk.getAvatar(groupAddress.trim().toLowerCase());
                return run(() => avatar.owner(), setGroupOwner);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Get Owner
            </button>
            <button
              onClick={async () => {
                const avatar = await sdk.getAvatar(groupAddress.trim().toLowerCase());
                return run(() => avatar.service(), setGroupService);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Get Service
            </button>
            <button
              onClick={async () => {
                const avatar = await sdk.getAvatar(groupAddress.trim().toLowerCase());
                return run(() => avatar.mintHandler(), setGroupMintHandler);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Get Mint Handler
            </button>
            <button
              onClick={async () => {
                const avatar = await sdk.getAvatar(groupAddress.trim().toLowerCase());
                return run(() => avatar.getMembershipConditions(), setMembershipConditions);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Get Membership Conditions
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
            <Result state={groupInfo} title="Group Info" onOpen={openModal} />
            <Result state={groupOwner} title="Group Owner" onOpen={openModal} />
            <Result state={groupService} title="Group Service" onOpen={openModal} />
            <Result state={groupMintHandler} title="Mint Handler" onOpen={openModal} />
            <Result state={membershipConditions} title="Membership Conditions" onOpen={openModal} />
          </div>
        </section>

        {/* 3. Group Discovery & Search */}
        <section id="group-discovery">
          <SectionHeader
            index="3"
            title="Group Discovery & Search"
            info="Search and discover groups by various criteria including name, symbol, owner, and type."
          />
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="Name starts with"
              value={groupSearch.params.nameStartsWith}
              onChange={(v) =>
                setGroupSearch({
                  ...groupSearch,
                  params: { ...groupSearch.params, nameStartsWith: v }
                })
              }
            />
            <Input
              placeholder="Symbol starts with"
              value={groupSearch.params.symbolStartsWith}
              onChange={(v) =>
                setGroupSearch({
                  ...groupSearch,
                  params: { ...groupSearch.params, symbolStartsWith: v }
                })
              }
            />
            <Input
              placeholder="Owner address"
              value={groupSearch.params.ownerEquals}
              onChange={(v) =>
                setGroupSearch({
                  ...groupSearch,
                  params: { ...groupSearch.params, ownerEquals: v }
                })
              }
            />
            <select
              value={groupSearch.params.groupType}
              onChange={(e) =>
                setGroupSearch({
                  ...groupSearch,
                  params: { ...groupSearch.params, groupType: e.target.value }
                })
              }
              className="w-full p-2 mt-2 border rounded bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
            >
              <option value="">All Types</option>
              <option value="CrcV2_CMGroupCreated">Core Members Group</option>
              <option value="CrcV2_BaseGroupCreated">Base Group</option>
              <option value="CrcV2_RegisterGroup">Standard Group</option>
            </select>
          </div>
          <Code>{`const groups = await sdk.data.findGroups(10, { nameStartsWith, symbolStartsWith, ownerEquals, groupTypeIn });`}</Code>
          <button
            onClick={() =>
              run(async () => {
                const params = Object.fromEntries(
                  Object.entries(groupSearch.params).filter(([_, v]) => v !== "")
                );
                if (params.groupType) {
                  params.groupTypeIn = [params.groupType];
                  delete params.groupType;
                }
                const query = sdk.data.findGroups(20, params);
                await query.queryNextPage();
                return query.currentPage?.results || [];
              }, (s) => setGroupSearch({ ...groupSearch, state: s }))
            }
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Search Groups
          </button>
          <Result state={groupSearch.state} title="Group Search Results" onOpen={openModal} />
        </section>

        {/* 4. Group Data & Analytics */}
        <section id="group-data">
          <SectionHeader
            index="4"
            title="Group Data & Analytics"
            info="Access detailed information about groups including memberships, balances, token info, events, and treasury data."
          />

          {/* 4.1 Group Memberships */}
          <SubHeader
            title="4.1 Group Memberships"
            info="Get all groups that a specific avatar is a member of."
          />
          <Code>{`const memberships = await sdk.data.getGroupMemberships(avatarAddress, 10);`}</Code>
          <Input
            placeholder="Avatar Address"
            value={groupMemberships.avatarAddress}
            onChange={(v) => setGroupMemberships({ ...groupMemberships, avatarAddress: v })}
          />
          <button
            onClick={() =>
              run(async () => {
                const query = sdk.data.getGroupMemberships(groupMemberships.avatarAddress.trim().toLowerCase(), 20);
                await query.queryNextPage();
                return query.currentPage?.results || [];
              }, (s) => setGroupMemberships({ ...groupMemberships, state: s }))
            }
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Get Group Memberships
          </button>
          <Result state={groupMemberships.state} title="Group Memberships" onOpen={openModal} />

          {/* 4.2 Token Information */}
          <SubHeader
            title="4.2 Token Information"
            info="Get detailed information about group tokens including type, owner, and metadata."
            noTopMargin
          />
          <Code>{`const tokenInfo = await sdk.data.getTokenInfo(tokenAddress);`}</Code>
          <Input
            placeholder="Token Address"
            value={tokenInfo.tokenAddress}
            onChange={(v) => setTokenInfo({ ...tokenInfo, tokenAddress: v })}
          />
          <button
            onClick={() =>
              run(() => sdk.data.getTokenInfo(tokenInfo.tokenAddress.trim().toLowerCase()), (s) => setTokenInfo({ ...tokenInfo, state: s }))
            }
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Get Token Info
          </button>
          <Result state={tokenInfo.state} title="Token Information" onOpen={openModal} />

          {/* 4.3 Group Events */}
          <SubHeader
            title="4.3 Group Events"
            info="Query blockchain events related to a specific group within a block range."
            noTopMargin
          />
          <Code>{`const events = await sdk.data.getEvents(groupAddress, fromBlock, toBlock, eventTypes);`}</Code>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="Group Address"
              value={groupEvents.groupAddress}
              onChange={(v) => setGroupEvents({ ...groupEvents, groupAddress: v })}
            />
            <Input
              placeholder="From Block (optional)"
              value={groupEvents.fromBlock}
              onChange={(v) => setGroupEvents({ ...groupEvents, fromBlock: v })}
            />
            <Input
              placeholder="To Block (optional)"
              value={groupEvents.toBlock}
              onChange={(v) => setGroupEvents({ ...groupEvents, toBlock: v })}
            />
            <Input
              placeholder="Event Types (comma separated, optional)"
              value={groupEvents.eventTypes}
              onChange={(v) => setGroupEvents({ ...groupEvents, eventTypes: v })}
            />
          </div>
          <button
            onClick={() =>
              run(() => {
                const fromBlock = groupEvents.fromBlock ? parseInt(groupEvents.fromBlock) : undefined;
                const toBlock = groupEvents.toBlock ? parseInt(groupEvents.toBlock) : undefined;
                const eventTypes = groupEvents.eventTypes ? safeCsv(groupEvents.eventTypes) : undefined;
                return sdk.data.getEvents(
                  groupEvents.groupAddress.trim().toLowerCase(),
                  fromBlock,
                  toBlock,
                  eventTypes
                );
              }, (s) => setGroupEvents({ ...groupEvents, state: s }))
            }
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Get Group Events
          </button>
          <Result state={groupEvents.state} title="Group Events" onOpen={openModal} />

          {/* 4.4 Treasury Information */}
          <SubHeader
            title="4.4 Treasury Information"
            info="Get treasury address and balance information for a group."
            noTopMargin
          />
          <Code>{`const treasuryAddr = await sdk.v2Hub.treasuries(groupAddress);\nconst balances = await sdk.data.getTokenBalances(treasuryAddr);`}</Code>
          <Input
            placeholder="Group Address"
            value={treasuryInfo.groupAddress}
            onChange={(v) => setTreasuryInfo({ ...treasuryInfo, groupAddress: v })}
          />
          <button
            onClick={() =>
              run(async () => {
                const treasuryAddr = await sdk.v2Hub?.treasuries(treasuryInfo.groupAddress.trim().toLowerCase());
                const balances = await sdk.data.getTokenBalances(treasuryAddr);
                return { treasuryAddress: treasuryAddr, balances };
              }, (s) => setTreasuryInfo({ ...treasuryInfo, state: s }))
            }
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Get Treasury Info
          </button>
          <Result state={treasuryInfo.state} title="Treasury Information" onOpen={openModal} />

          {/* 4.5 Group Trust Relations */}
          <SubHeader
            title="4.5 Group Trust Relations"
            info="Get all trust relations for a group including who trusts the group and who the group trusts."
            noTopMargin
          />
          <Code>{`const trustRelations = await sdk.data.getAggregatedTrustRelations(groupAddress, 2);`}</Code>
          <Input
            placeholder="Group Address"
            value={groupTrustRelations.groupAddress}
            onChange={(v) => setGroupTrustRelations({ ...groupTrustRelations, groupAddress: v })}
          />
          <button
            onClick={() =>
              run(() => sdk.data.getAggregatedTrustRelations(groupTrustRelations.groupAddress.trim().toLowerCase(), 2), 
                  (s) => setGroupTrustRelations({ ...groupTrustRelations, state: s }))
            }
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Get Trust Relations
          </button>
          <Result state={groupTrustRelations.state} title="Group Trust Relations" onOpen={openModal} />

          {/* 4.6 Group Balance */}
          <SubHeader
            title="4.6 Group Balance"
            info="Get total balance and detailed token balances for a group."
            noTopMargin
          />
          <Code>{`const totalBalance = await sdk.data.getTotalBalanceV2(groupAddress, true);\nconst tokenBalances = await sdk.data.getTokenBalances(groupAddress);`}</Code>
          <Input
            placeholder="Group Address"
            value={groupBalance.groupAddress}
            onChange={(v) => setGroupBalance({ ...groupBalance, groupAddress: v })}
          />
          <button
            onClick={() =>
              run(async () => {
                const [totalBalance, tokenBalances] = await Promise.all([
                  sdk.data.getTotalBalanceV2(groupBalance.groupAddress.trim().toLowerCase(), true),
                  sdk.data.getTokenBalances(groupBalance.groupAddress.trim().toLowerCase())
                ]);
                return { totalBalance, tokenBalances };
              }, (s) => setGroupBalance({ ...groupBalance, state: s }))
            }
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Get Group Balance
          </button>
          <Result state={groupBalance.state} title="Group Balance" onOpen={openModal} />
        </section>

        {/* 5. Group Operations */}
        <section id="group-operations">
          <SectionHeader
            index="5"
            title="Group Operations"
            info="Core group operations including trust management, minting, and redemption."
          />

          {/* 5.1 Trust Operations */}
          <SubHeader
            title="5.1 Trust Operations"
            info="Manage trust relationships for groups, including time-limited trust for Base Groups."
          />
          <Code>{`await groupAvatar.trust([avatar1, avatar2], expiry);`}</Code>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="Avatar Addresses (comma separated)"
              value={trustOperation.avatars}
              onChange={(v) => setTrustOperation({ ...trustOperation, avatars: v })}
            />
            <Input
              placeholder="Expiry (Unix timestamp, optional)"
              value={trustOperation.expiry}
              onChange={(v) => setTrustOperation({ ...trustOperation, expiry: v })}
            />
          </div>
          <div className="flex gap-2 mt-2">
            <button
              onClick={async () => {
                const avatar = await sdk.getAvatar(groupAddress.trim().toLowerCase());
                const avatars = safeCsv(trustOperation.avatars);
                const expiry = trustOperation.expiry ? BigInt(trustOperation.expiry) : undefined;
                return run(() => avatar.trust(avatars, expiry), (s) => setTrustOperation({ ...trustOperation, state: s }));
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Trust Avatars
            </button>
            <button
              onClick={async () => {
                const avatar = await sdk.getAvatar(groupAddress.trim().toLowerCase());
                const avatars = safeCsv(trustOperation.avatars);
                return run(() => avatar.untrust(avatars), (s) => setTrustOperation({ ...trustOperation, state: s }));
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Untrust Avatars
            </button>
          </div>
          <Result state={trustOperation.state} title="Trust Operation" onOpen={openModal} />

          {/* 5.2 Group Mint */}
          <SubHeader
            title="5.2 Group Mint"
            info="Mint group tokens using personal Circles as collateral."
            noTopMargin
          />
          <Code>{`await avatar.groupMint(group, [collateral1], [amount1], data);`}</Code>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              placeholder="Group Address"
              value={groupMintOp.group}
              onChange={(v) => setGroupMintOp({ ...groupMintOp, group: v })}
            />
            <Input
              placeholder="Collateral Addresses (comma separated)"
              value={groupMintOp.collateral}
              onChange={(v) => setGroupMintOp({ ...groupMintOp, collateral: v })}
            />
            <Input
              placeholder="Amounts (comma separated, in atto-circles)"
              value={groupMintOp.amounts}
              onChange={(v) => setGroupMintOp({ ...groupMintOp, amounts: v })}
            />
          </div>
          <button
            onClick={async () => {
              const avatar = await sdk.getAvatar(address!);
              const collaterals = safeCsv(groupMintOp.collateral);
              const amounts = groupMintOp.amounts.split(',').map(a => BigInt(a.trim()));
              const data = new Uint8Array(0); // Empty data
              return run(
                () => avatar.groupMint(groupMintOp.group.trim(), collaterals, amounts, data),
                (s) => setGroupMintOp({ ...groupMintOp, state: s })
              );
            }}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Mint Group Tokens
          </button>
          <Result state={groupMintOp.state} title="Group Mint" onOpen={openModal} />

          {/* 5.3 Group Redeem */}
          <SubHeader
            title="5.3 Group Redeem"
            info="Redeem group tokens for collateral from the group treasury."
            noTopMargin
          />
          <Code>{`await avatar.groupRedeem(group, [collateral1], [amount1]);`}</Code>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              placeholder="Group Address"
              value={groupRedeemOp.group}
              onChange={(v) => setGroupRedeemOp({ ...groupRedeemOp, group: v })}
            />
            <Input
              placeholder="Collateral Addresses (comma separated)"
              value={groupRedeemOp.collateral}
              onChange={(v) => setGroupRedeemOp({ ...groupRedeemOp, collateral: v })}
            />
            <Input
              placeholder="Amounts (comma separated, in atto-circles)"
              value={groupRedeemOp.amounts}
              onChange={(v) => setGroupRedeemOp({ ...groupRedeemOp, amounts: v })}
            />
          </div>
          <button
            onClick={async () => {
              const avatar = await sdk.getAvatar(address!);
              const collaterals = safeCsv(groupRedeemOp.collateral);
              const amounts = groupRedeemOp.amounts.split(',').map(a => BigInt(a.trim()));
              return run(
                () => avatar.groupRedeem(groupRedeemOp.group.trim(), collaterals, amounts),
                (s) => setGroupRedeemOp({ ...groupRedeemOp, state: s })
              );
            }}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Redeem Group Tokens
          </button>
          <Result state={groupRedeemOp.state} title="Group Redeem" onOpen={openModal} />

          {/* 5.4 Auto Redeem (Base Groups only) */}
          <SubHeader
            title="5.4 Auto Redeem (Base Groups)"
            info="Automatically redeem group tokens for trusted collateral using pathfinder optimization."
            noTopMargin
          />
          <Code>{`await avatar.groupRedeemAuto(group, amount);`}</Code>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="Base Group Address"
              value={autoRedeemOp.group}
              onChange={(v) => setAutoRedeemOp({ ...autoRedeemOp, group: v })}
            />
            <Input
              placeholder="Amount (in atto-circles)"
              value={autoRedeemOp.amount}
              onChange={(v) => setAutoRedeemOp({ ...autoRedeemOp, amount: v })}
            />
          </div>
          <button
            onClick={async () => {
              const avatar = await sdk.getAvatar(address!);
              const amount = BigInt(autoRedeemOp.amount);
              return run(
                () => avatar.groupRedeemAuto(autoRedeemOp.group.trim(), amount),
                (s) => setAutoRedeemOp({ ...autoRedeemOp, state: s })
              );
            }}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Auto Redeem
          </button>
          <Result state={autoRedeemOp.state} title="Auto Redeem" onOpen={openModal} />
        </section>

        {/* 6. Group Administration */}
        <section id="group-admin">
          <SectionHeader
            index="6"
            title="Group Administration"
            info="Administrative functions for group owners including setting handlers and managing membership conditions."
          />

          {/* 6.1 Set Owner */}
          <SubHeader
            title="6.1 Set Owner"
            info="Transfer group ownership to a new address."
          />
          <Code>{`await groupAvatar.setOwner(newOwner);`}</Code>
          <Input
            placeholder="New Owner Address"
            value={setOwnerOp.newOwner}
            onChange={(v) => setSetOwnerOp({ ...setOwnerOp, newOwner: v })}
          />
          <button
            onClick={async () => {
              const avatar = await sdk.getAvatar(groupAddress.trim().toLowerCase());
              return run(
                () => avatar.setOwner(setOwnerOp.newOwner.trim()),
                (s) => setSetOwnerOp({ ...setOwnerOp, state: s })
              );
            }}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Set Owner
          </button>
          <Result state={setOwnerOp.state} title="Set Owner" onOpen={openModal} />

          {/* 6.2 Set Service */}
          <SubHeader
            title="6.2 Set Service"
            info="Update the service address for the group."
            noTopMargin
          />
          <Code>{`await groupAvatar.setService(newService);`}</Code>
          <Input
            placeholder="New Service Address"
            value={setServiceOp.newService}
            onChange={(v) => setSetServiceOp({ ...setServiceOp, newService: v })}
          />
          <button
            onClick={async () => {
              const avatar = await sdk.getAvatar(groupAddress.trim().toLowerCase());
              return run(
                () => avatar.setService(setServiceOp.newService.trim()),
                (s) => setSetServiceOp({ ...setServiceOp, state: s })
              );
            }}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Set Service
          </button>
          <Result state={setServiceOp.state} title="Set Service" onOpen={openModal} />

          {/* 6.3 Membership Conditions (Base Groups only) */}
          <SubHeader
            title="6.3 Membership Conditions"
            info="Manage membership conditions for Base Groups to control who can join."
            noTopMargin
          />
          <Code>{`await baseGroupAvatar.setMembershipCondition(condition, enabled);`}</Code>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="Condition Address"
              value={membershipConditionOp.condition}
              onChange={(v) => setMembershipConditionOp({ ...membershipConditionOp, condition: v })}
            />
            <select
              value={membershipConditionOp.enabled ? "true" : "false"}
              onChange={(e) => setMembershipConditionOp({ 
                ...membershipConditionOp, 
                enabled: e.target.value === "true" 
              })}
              className="w-full p-2 mt-2 border rounded bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
            >
              <option value="true">Enable</option>
              <option value="false">Disable</option>
            </select>
          </div>
          <button
            onClick={async () => {
              const avatar = await sdk.getAvatar(groupAddress.trim().toLowerCase());
              return run(
                () => avatar.setMembershipCondition(
                  membershipConditionOp.condition.trim(),
                  membershipConditionOp.enabled
                ),
                (s) => setMembershipConditionOp({ ...membershipConditionOp, state: s })
              );
            }}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Set Membership Condition
          </button>
          <Result state={membershipConditionOp.state} title="Membership Condition" onOpen={openModal} />
        </section>
      </main>

      <Modal open={modal.open} onClose={closeModal} title={modal.title}>
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
  onOpen: (title: string, data?: any, error?: string) => void;
}) {
  if (!state.loading && !state.error && state.result === undefined) return null;
  return (
    <div className="mt-3 flex items-start gap-3">
      {state.loading && <p>Loading…</p>}

      {state.error && (
        <div className="flex items-center gap-2">
          <p className="text-red-500">Error: {state.error}</p>
          <button
            onClick={() => onOpen(`${title} (Error)`, undefined, state.error)}
            className="px-3 py-1 text-xs rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
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
            onClick={() => onOpen(title, state.result)}
            className="px-3 py-1 text-xs rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
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
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full p-2 mt-2 border rounded bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
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
        type="button"
        aria-label="info"
        onClick={() => setOpen((o) => !o)}
        className="mt-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
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
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" {...props}>
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
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-3xl max-h-[85vh] overflow-hidden rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b dark:border-gray-700">
          <h4 className="font-semibold text-lg truncate">{title ?? "Result"}</h4>
          <button
            onClick={onClose}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-4 overflow-auto max-h-[70vh]">{children}</div>

        {/* Footer */}
        <div className="px-4 py-3 border-t dark:border-gray-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}