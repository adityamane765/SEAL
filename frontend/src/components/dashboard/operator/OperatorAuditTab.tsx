"use client";

import { useCallback, useEffect, useState } from "react";
import { useAccount, useSignMessage } from "wagmi";
import { SelectiveRevealPanel } from "@/components/dashboard/SelectiveRevealPanel";
import { sealApiBase } from "@/lib/wagmi-config";
import { buildDenyMessage } from "@/lib/audit-message";

type Tone = "neutral" | "ok" | "warn" | "bad";

function pillTone(v: Tone) {
  return v === "ok"
    ? "border-emerald-300 bg-emerald-50 text-emerald-950"
    : v === "warn"
      ? "border-amber-300 bg-amber-50 text-amber-950"
      : v === "bad"
        ? "border-rose-300 bg-rose-50 text-rose-950"
        : "border-[#05058a]/15 bg-[#f5f5f0] text-[#05058a]/70";
}

type AuditStatus = "pending" | "revealed" | "denied";

type AuditRequest = {
  id: string;
  createdAt: string;
  agentIdBytes32: string;
  auditorAddress: string;
  scope: string;
  status: AuditStatus;
  note?: string;
  revealedPlaintext?: string;
  revealedAt?: string;
  denyAt?: string;
};

function shortHex(hex: string, n = 10) {
  if (!hex || hex.length < n + 4) return hex;
  return `${hex.slice(0, n)}…${hex.slice(-6)}`;
}

export function OperatorAuditTab(props: { selectedActionLabel: string }) {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const [requests, setRequests] = useState<AuditRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [revealPk, setRevealPk] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!address) {
      setRequests([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const r = await fetch(`${sealApiBase}/api/audit-requests?operator=${encodeURIComponent(address)}`);
      const j = (await r.json()) as { requests?: AuditRequest[]; error?: string };
      if (!r.ok) throw new Error(j.error || r.statusText);
      setRequests(j.requests ?? []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    void load();
  }, [load]);

  async function deny(req: AuditRequest) {
    if (!address) return;
    setBusyId(req.id);
    setActionError(null);
    try {
      const msg = buildDenyMessage(req.id, req.agentIdBytes32);
      const signature = await signMessageAsync({ message: msg });
      const res = await fetch(`${sealApiBase}/api/audit-requests/${encodeURIComponent(req.id)}/deny`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signature }),
      });
      const j = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(j.error || res.statusText);
      await load();
    } catch (e: unknown) {
      setActionError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusyId(null);
    }
  }

  async function reveal(req: AuditRequest) {
    const pk = revealPk[req.id]?.trim();
    if (!pk) {
      setActionError("Paste the agent owner private key (same wallet that sealed the blob) to decrypt.");
      return;
    }
    setBusyId(req.id);
    setActionError(null);
    try {
      const res = await fetch(`${sealApiBase}/api/audit-requests/${encodeURIComponent(req.id)}/reveal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ operatorPrivateKey: pk }),
      });
      const j = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(j.error || res.statusText);
      setRevealPk((prev) => ({ ...prev, [req.id]: "" }));
      await load();
    } catch (e: unknown) {
      setActionError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      <section className="lg:col-span-6">
        <div className="border border-[#05058a]/15 bg-white p-6">
          <p className="text-[11px] uppercase tracking-[0.22em] text-[#05058a]/65">Audit requests inbox</p>
          <p className="mt-2 text-sm text-[#05058a]/70">
            Signed requests from auditors (backend <span className="font-mono">/api/audit-requests</span>). Reveal decrypts all stored sealed blobs for that agent
            and attaches plaintext for the auditor wallet. Deny uses your connected wallet signature.
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void load()}
              className="border border-[#05058a]/25 bg-white px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] text-[#05058a] hover:bg-[#f5f5f0]"
            >
              Refresh
            </button>
            {loading ? <span className="text-xs text-[#05058a]/55">Loading…</span> : null}
          </div>

          {!isConnected || !address ? (
            <p className="mt-4 text-sm text-amber-900">Connect the operator wallet (agent owner) to see requests for your agents.</p>
          ) : null}
          {error ? <p className="mt-3 text-sm text-rose-800">{error}</p> : null}
          {actionError ? <p className="mt-3 text-sm text-rose-800">{actionError}</p> : null}

          <div className="mt-5 grid gap-3">
            {requests.length === 0 && address && !loading ? (
              <p className="text-sm text-[#05058a]/65">No pending or completed requests for this wallet.</p>
            ) : null}
            {requests.map((r) => (
              <div key={r.id} className="border border-[#05058a]/15 bg-[#f5f5f0] px-4 py-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-[11px] text-[#2020e8]">{r.id}</p>
                    <p className="mt-2 text-sm font-black tracking-[-0.01em] text-[#05058a]">
                      Agent <span className="font-mono text-xs">{shortHex(r.agentIdBytes32, 14)}</span>
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-[#05058a]/70">
                      Auditor: <span className="font-mono">{shortHex(r.auditorAddress, 8)}</span> · {r.scope}
                    </p>
                    {r.note ? <p className="mt-2 text-sm text-[#05058a]/70">{r.note}</p> : null}
                    <p className="mt-2 font-mono text-xs text-[#05058a]/60">{r.createdAt}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center border px-2 py-1 text-[10px] uppercase tracking-[0.18em] ${pillTone(
                        r.status === "revealed" ? "ok" : r.status === "denied" ? "bad" : "warn",
                      )}`}
                    >
                      {r.status}
                    </span>
                  </div>
                </div>

                {r.status === "revealed" && r.revealedPlaintext ? (
                  <pre className="mt-4 max-h-48 overflow-auto border border-[#05058a]/15 bg-white p-3 text-[11px] leading-relaxed text-[#05058a]/80">
                    {r.revealedPlaintext}
                  </pre>
                ) : null}

                {r.status === "pending" ? (
                  <div className="mt-4 space-y-3">
                    <div>
                      <label className="text-[10px] uppercase tracking-[0.2em] text-[#05058a]/60">
                        Operator private key (decrypt — demo only)
                      </label>
                      <input
                        type="password"
                        autoComplete="off"
                        value={revealPk[r.id] ?? ""}
                        onChange={(e) => setRevealPk((prev) => ({ ...prev, [r.id]: e.target.value }))}
                        placeholder="0x… (same wallet that authorized the sealed blob)"
                        className="mt-1 w-full border border-[#05058a]/30 bg-white px-3 py-2 font-mono text-[11px] text-[#05058a] outline-none focus:border-[#05058a]"
                      />
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2">
                      <button
                        type="button"
                        disabled={busyId === r.id}
                        onClick={() => void reveal(r)}
                        className="w-full bg-[#05058a] px-5 py-3 text-[11px] uppercase tracking-[0.18em] text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                      >
                        {busyId === r.id ? "Working…" : "Reveal to auditor"}
                      </button>
                      <button
                        type="button"
                        disabled={busyId === r.id}
                        onClick={() => void deny(r)}
                        className="w-full border border-[#05058a]/20 bg-white px-5 py-3 text-[11px] uppercase tracking-[0.18em] text-[#05058a] transition-colors hover:bg-[#f5f5f0] disabled:opacity-50"
                      >
                        Deny
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="lg:col-span-6">
        <div className="border border-[#05058a]/15 bg-white p-6">
          <p className="text-[11px] uppercase tracking-[0.22em] text-[#05058a]/65">Reveal view</p>
          <p className="mt-2 text-sm text-[#05058a]/70">
            Manual selective reveal (CID + Lit fields). Automated auditor flow uses the inbox on the left after you run a pipeline that persists sealed blobs.
          </p>

          <div className="mt-5 border border-[#05058a]/15 bg-[#f5f5f0] p-4">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#05058a]/55">Context</p>
            <p className="mt-2 text-sm text-[#05058a]/70">
              Selected action: <span className="font-mono">{props.selectedActionLabel}</span>
            </p>
          </div>

          <div className="mt-6">
            <SelectiveRevealPanel />
          </div>
        </div>
      </section>
    </div>
  );
}
