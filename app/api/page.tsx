"use client";

import React, { useEffect, useState } from "react";

type RpcResult = {
  loading: boolean;
  error: string | null;
  data: any;
};

type RpcMethod = {
  key: string;
  title: string;
  description: string;
  url: string;
  method: string;
  getParams: (address: string) => any[];
};

const defaultAddress = "0x42cedde51198d1773590311e2a340dc06b24cb37";
const commonTrustDefault = "0x42cedde51198d1773590311e2a340dc06b24cb37";

const rpcMethods: RpcMethod[] = [
  {
    key: "v1TotalBalance",
    title: "V1 Total Balance",
    description: "Get the total V1 CRC balance of an address.",
    url: "https://rpc.aboutcircles.com/circles_getTotalBalance",
    method: "circles_getTotalBalance",
    getParams: (addr) => [addr, true],
  },
  {
    key: "v2TotalBalance",
    title: "V2 Total Balance",
    description: "Get the total V2 CRC balance of an address.",
    url: "https://rpc.aboutcircles.com/circlesV2_getTotalBalance",
    method: "circlesV2_getTotalBalance",
    getParams: (addr) => [addr, true],
  },
  {
    key: "tokenBalances",
    title: "Token Balances (On-chain)",
    description: "Fetch raw on-chain CRC token balances for a given address.",
    url: "https://rpc.aboutcircles.com/circles_getTokenBalances",
    method: "circles_getTokenBalances",
    getParams: (addr) => [addr],
  },
  {
    key: "balanceBreakdown",
    title: "Balance Breakdown (Indexed)",
    description: "Get a fast, indexed breakdown of balances per CRC token.",
    url: "https://rpc.aboutcircles.com/circles_getBalanceBreakdown",
    method: "circles_getBalanceBreakdown",
    getParams: (addr) => [addr],
  },
  {
    key: "trustRelations",
    title: "Trust Relations",
    description: "List all trust edges (incoming & outgoing) for an avatar.",
    url: "https://rpc.aboutcircles.com/circles_getTrustRelations",
    method: "circles_getTrustRelations",
    getParams: (addr) => [addr],
  },
  {
    key: "commonTrust",
    title: "Common Trust",
    description: "Find common outgoing trustees between two avatars.",
    url: "https://rpc.aboutcircles.com/circles_getCommonTrust",
    method: "circles_getCommonTrust",
    getParams: (addr) => [addr, commonTrustDefault],
  },
  {
    key: "findPathV2",
    title: "Find Path (V2)",
    description: "Compute a trust-path allocation achieving a target flow.",
    url: "https://rpc.aboutcircles.com/circlesV2_findPath",
    method: "circlesV2_findPath",
    getParams: (addr) => [
      { Source: addr, Sink: defaultAddress, TargetFlow: "99999999999999999999999999999999999" },
    ],
  },
  {
    key: "events",
    title: "Events Stream",
    description: "Stream on-chain events (logs) for an avatar over a block range.",
    url: "https://rpc.aboutcircles.com/circles_events",
    method: "circles_events",
    getParams: (addr) => [addr, 38000000, null, ["CrcV1_Trust"], null, false],
  },
  {
    key: "health",
    title: "Health Probe",
    description: "Check the health/status of the Circles RPC system.",
    url: "https://rpc.aboutcircles.com/circles_health",
    method: "circles_health",
    getParams: () => [],
  },
  {
    key: "tables",
    title: "Tables & Namespaces",
    description: "List all available namespaces & tables in the Circles database.",
    url: "https://rpc.aboutcircles.com/circles_tables",
    method: "circles_tables",
    getParams: () => [],
  },
];

export default function CirclesExplorerPage() {
  const [address, setAddress] = useState(defaultAddress);
  const [results, setResults] = useState<Record<string, RpcResult>>({});
  const [resultModal, setResultModal] = useState({ open: false, title: "", content: null });
  const [infoModal, setInfoModal] = useState({ open: false, title: "", code: "" });

  async function callRpc(m: RpcMethod) {
    setResults(r => ({ ...r, [m.key]: { loading: true, error: null, data: null } }));
    try {
      const payload = { jsonrpc: "2.0", id: 1, method: m.method, params: m.getParams(address) };
      const response = await fetch(m.url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await response.json();
      setResults(r => ({ ...r, [m.key]: { loading: false, error: null, data: json } }));
    } catch (error: any) {
      setResults(r => ({ ...r, [m.key]: { loading: false, error: error.message, data: null } }));
    }
  }

  const runAll = () => rpcMethods.forEach(callRpc);

  useEffect(runAll, [address]);

  const openResult = (title: string, content: any) => setResultModal({ open: true, title, content });
  const closeResult = () => setResultModal(r => ({ ...r, open: false }));
  const openInfo = (m: RpcMethod) => {
    const code = `POST ${m.url}
Content-Type: application/json

${JSON.stringify({ jsonrpc: "2.0", id: 1, method: m.method, params: m.getParams(address) }, null, 2)}`;
    setInfoModal({ open: true, title: m.title, code });
  };
  const closeInfo = () => setInfoModal(i => ({ ...i, open: false }));

  return (
    <main className="bg-gray-100 dark:bg-gray-900 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-6">Circles JSON-RPC Examples</h1>

        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <input
            type="text"
            value={address}
            onChange={e => setAddress(e.target.value)}
            placeholder="Enter avatar address"
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={runAll}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white font-semibold rounded-lg"
          >
            Fetch Data
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rpcMethods.map(m => {
            const res = results[m.key] || { loading: false, error: null, data: null };
            return (
              <div key={m.key} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-md hover:shadow-lg transition-colors">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{m.title}</h2>
                <p className="mt-2 text-gray-600 dark:text-gray-300">{m.description}</p>

                <div className="mt-4">
                  {res.loading && <p className="text-gray-500 dark:text-gray-400">Loading...</p>}
                  {res.error && <p className="text-red-600 dark:text-red-400">Error: {res.error}</p>}
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    onClick={() => openInfo(m)}
                    className="px-3 py-1 bg-indigo-500 hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white rounded-lg"
                  >
                    Code
                  </button>
                  <button
                    onClick={() => openResult(m.title, res.data)}
                    disabled={res.loading || !!res.error || !res.data}
                    className="px-4 py-1 bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white rounded-lg disabled:opacity-50"
                  >
                    Result
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {resultModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={closeResult}>
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full p-6 max-h-[70vh] overflow-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{resultModal.title} Result</h3>
              <button onClick={closeResult} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">×</button>
            </div>
            <pre className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap break-words">{JSON.stringify(resultModal.content, null, 2)}</pre>
          </div>
        </div>
      )}

      {infoModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={closeInfo}>
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-lg w-full p-6 max-h-[70vh] overflow-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{infoModal.title} RPC Call</h3>
              <button onClick={closeInfo} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">×</button>
            </div>
            <pre className="text-sm bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-lg p-4 whitespace-pre-wrap break-words">{infoModal.code}</pre>
          </div>
        </div>
      )}
    </main>
  );
}