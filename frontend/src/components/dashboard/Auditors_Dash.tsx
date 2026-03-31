"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useSignMessage } from "wagmi";
import { isAddress } from "viem";

type AuditStatus = "pending" | "approved" | "denied";

type AuditRequest = {
  id: string;
  createdAt: string;
  contractAddress: string;
  scope: string;
  reason: string;
  organisation?: string;
  requester: string;
  signature?: string;
  status: AuditStatus;
};

function Pill({ status }: { status: AuditStatus }) {
  const cls =
    status === "approved"
      ? "border-emerald-300 bg-emerald-50 text-emerald-950"
      : status === "denied"
        ? "border-rose-300 bg-rose-50 text-rose-950"
        : "border-amber-300 bg-amber-50 text-amber-950";
  return (
    <span
      className={`inline-flex items-center border px-2 py-1 text-[10px] uppercase tracking-[0.18em] ${cls}`}
    >
      {status}
    </span>
  );
}

function buildAuditMessage(r: {
  contractAddress: string;
  scope: string;
  reason: string;
  organisation?: string;
}) {
  const lines = [
    "SEAL — Audit request",
    "",
    `Contract: ${r.contractAddress}`,
    `Scope: ${r.scope}`,
    `Reason: ${r.reason}`,
    r.organisation?.trim() ? `Organisation: ${r.organisation.trim()}` : undefined,
    "",
    "I request an audit and consent to disclose this signed request to the operator.",
  ].filter(Boolean) as string[];
  return lines.join("\n");
}

export function Auditors_Dash() {
  const { isConnected, address } = useAccount();
  const { signMessageAsync, isPending: signing } = useSignMessage();

  const [contractAddress, setContractAddress] = useState("");
  const [scope, setScope] = useState<"full history" | "time range" | "actions">("full history");
  const [timeRange, setTimeRange] = useState("");
  const [actions, setActions] = useState("");
  const [reason, setReason] = useState("");
  const [organisation, setOrganisation] = useState("");

  const [requests, setRequests] = useState<AuditRequest[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [revealOpen, setRevealOpen] = useState(false);

  const scopeValue = useMemo(() => {
    if (scope === "time range") return timeRange.trim() ? `time range: ${timeRange.trim()}` : "time range: (unset)";
    if (scope === "actions") return actions.trim() ? `actions: ${actions.trim()}` : "actions: (unset)";
    return "full history";
  }, [actions, scope, timeRange]);

  const contractOk = isAddress(contractAddress.trim());
  const canSubmit = isConnected && !!address && contractOk && !!reason.trim();

  async function submit() {
    if (!address) return;
    const msg = buildAuditMessage({
      contractAddress: contractAddress.trim(),
      scope: scopeValue,
      reason: reason.trim(),
      organisation: organisation.trim() ? organisation.trim() : undefined,
    });

    const sig = await signMessageAsync({ message: msg });

    const now = new Date();
    const id = `REQ-${now.getTime().toString().slice(-6)}`;
    const next: AuditRequest = {
      id,
      createdAt: now.toISOString(),
      contractAddress: contractAddress.trim(),
      scope: scopeValue,
      reason: reason.trim(),
      organisation: organisation.trim() ? organisation.trim() : undefined,
      requester: address,
      signature: sig,
      status: "pending",
    };

    setRequests((prev) => [next, ...prev]);
    setSelectedId(id);
  }

  const selected = requests.find((r) => r.id === selectedId) ?? null;
  const revealUnlocked = selected?.status === "approved";

  return (
    <div className="w-full">
      <div className="border border-[#05058a]/15 bg-white p-6">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-[62rem]">
            <p className="text-[11px] uppercase tracking-[0.22em] text-[#05058a]/65">
              Path B — Auditor portal
            </p>
            <h1 className="mt-3 text-[clamp(34px,4.8vw,62px)] font-black leading-[0.95] tracking-[-0.03em] text-[#05058a]">
              Auditor portal
            </h1>
            <p className="mt-4 max-w-[56rem] text-sm leading-relaxed text-[#05058a]/70">
              Requires: EVM wallet connect + a signed request (cryptographic identity).
            </p>
          </div>

          <div className="w-full md:w-auto md:text-right">
            <div className="md:hidden">
              <ConnectButton chainStatus="icon" showBalance={false} />
            </div>
            <p className="mt-3 text-[11px] uppercase tracking-[0.18em] text-[#05058a]/55 md:mt-2">
              Auditor identity
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-12">
        <section className="lg:col-span-6">
          <div className="border border-[#05058a]/15 bg-white p-6">
            <p className="text-[11px] uppercase tracking-[0.22em] text-[#05058a]/65">
              1) Audit request form
            </p>

            <div className="mt-5 grid gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#05058a]/60">
                  Agent contract address to audit
                </p>
                <input
                  value={contractAddress}
                  onChange={(e) => setContractAddress(e.target.value)}
                  placeholder="0x…"
                  className="mt-2 w-full border border-[#05058a]/30 bg-[#f5f5f0] px-3 py-2 font-mono text-sm text-[#05058a] outline-none focus:border-[#05058a]"
                />
                {!contractAddress.trim() ? null : contractOk ? null : (
                  <p className="mt-2 text-xs text-amber-900">
                    Enter a valid EVM address.
                  </p>
                )}
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#05058a]/60">
                  Scope
                </p>
                <div className="mt-2 grid gap-2 sm:grid-cols-3">
                  {(["full history", "time range", "actions"] as const).map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setScope(v)}
                      className={`border px-3 py-2 text-[11px] uppercase tracking-[0.18em] ${
                        scope === v
                          ? "border-[#05058a] bg-white text-[#05058a]"
                          : "border-[#05058a]/15 bg-[#f5f5f0] text-[#05058a]/70 hover:bg-white"
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              {scope === "time range" ? (
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-[#05058a]/60">
                    Time range
                  </p>
                  <input
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value)}
                    placeholder='e.g. "2026-03-01..2026-03-31"'
                    className="mt-2 w-full border border-[#05058a]/30 bg-[#f5f5f0] px-3 py-2 font-mono text-sm text-[#05058a] outline-none focus:border-[#05058a]"
                  />
                </div>
              ) : null}

              {scope === "actions" ? (
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-[#05058a]/60">
                    Actions
                  </p>
                  <input
                    value={actions}
                    onChange={(e) => setActions(e.target.value)}
                    placeholder='e.g. "ACT-10288, ACT-10289"'
                    className="mt-2 w-full border border-[#05058a]/30 bg-[#f5f5f0] px-3 py-2 font-mono text-sm text-[#05058a] outline-none focus:border-[#05058a]"
                  />
                </div>
              ) : null}

              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#05058a]/60">
                  Reason (becomes part of signed request)
                </p>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Free text…"
                  className="mt-2 min-h-[112px] w-full resize-y border border-[#05058a]/30 bg-[#f5f5f0] px-3 py-2 text-sm text-[#05058a] outline-none focus:border-[#05058a]"
                />
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#05058a]/60">
                  Identity / organisation (optional)
                </p>
                <input
                  value={organisation}
                  onChange={(e) => setOrganisation(e.target.value)}
                  placeholder="Optional metadata…"
                  className="mt-2 w-full border border-[#05058a]/30 bg-[#f5f5f0] px-3 py-2 text-sm text-[#05058a] outline-none focus:border-[#05058a]"
                />
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={submit}
                  disabled={!canSubmit || signing}
                  className="bg-[#05058a] px-5 py-3 text-[11px] uppercase tracking-[0.18em] text-white transition-opacity hover:opacity-90 disabled:opacity-40"
                >
                  {signing ? "Signing…" : "Sign + submit request"}
                </button>
                <p className="text-xs text-[#05058a]/65">
                  This signs a request now. Wiring on-chain submission + operator notification is the next step.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="lg:col-span-6">
          <div className="border border-[#05058a]/15 bg-white p-6">
            <p className="text-[11px] uppercase tracking-[0.22em] text-[#05058a]/65">
              2) Pending requests
            </p>

            {requests.length === 0 ? (
              <p className="mt-4 text-sm text-[#05058a]/70">
                No requests yet. Submit an audit request to populate this list.
              </p>
            ) : (
              <div className="mt-5 grid gap-3">
                {requests.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => {
                      setSelectedId(r.id);
                      if (r.status === "approved") setRevealOpen(true);
                    }}
                    className={`text-left border px-4 py-4 transition-colors ${
                      selectedId === r.id
                        ? "border-[#05058a] bg-white"
                        : "border-[#05058a]/15 bg-[#f5f5f0] hover:bg-white"
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#2020e8]">
                          {r.id}
                        </p>
                        <p className="mt-2 text-sm font-black tracking-[-0.01em] text-[#05058a]">
                          {r.scope}
                        </p>
                        <p className="mt-2 text-xs text-[#05058a]/65">
                          contract: <span className="font-mono">{r.contractAddress}</span>
                        </p>
                        <p className="mt-2 text-xs text-[#05058a]/65">
                          created: <span className="font-mono">{r.createdAt}</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Pill status={r.status} />
                      </div>
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-[#05058a]/70">
                      {r.reason}
                    </p>

                    {r.status === "approved" ? (
                      <div className="mt-4 flex flex-wrap items-center gap-3">
                        <span className="text-[10px] uppercase tracking-[0.2em] text-[#05058a]/55">
                          Reveal unlocked
                        </span>
                        <span className="text-[10px] uppercase tracking-[0.2em] text-[#2020e8]">
                          Click to view
                        </span>
                      </div>
                    ) : null}
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      {revealOpen ? (
        <div
          className="fixed inset-0 z-[200] flex items-end justify-center bg-black/50 p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-[980px] border border-[#05058a]/15 bg-white">
            <div className="flex items-start justify-between gap-4 border-b border-[#05058a]/15 p-5">
              <div>
                <p className="text-[11px] uppercase tracking-[0.22em] text-[#05058a]/65">
                  Reveal view
                </p>
                <p className="mt-2 text-sm text-[#05058a]/70">
                  {selected ? (
                    <>
                      Request <span className="font-mono">{selected.id}</span> · status{" "}
                      <span className="font-mono">{selected.status}</span>
                    </>
                  ) : (
                    "No request selected."
                  )}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setRevealOpen(false)}
                className="border border-[#05058a]/20 bg-white px-4 py-2 text-[11px] uppercase tracking-[0.18em] text-[#05058a] hover:bg-[#f5f5f0]"
              >
                Close
              </button>
            </div>

            <div className="p-5">
              {!selected ? (
                <p className="text-sm text-[#05058a]/70">
                  Select a request first.
                </p>
              ) : !revealUnlocked ? (
                <div className="border border-amber-300 bg-amber-50 px-4 py-4 text-sm text-amber-950">
                  Locked. This request is <span className="font-mono">{selected.status}</span>. Reveal unlocks only when an operator approves.
                </div>
              ) : (
                <div className="grid gap-6 lg:grid-cols-12">
                  <section className="lg:col-span-7">
                    <div className="border border-[#05058a]/15 bg-[#f5f5f0] p-4">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-[#05058a]/60">
                        Unlocked actions
                      </p>
                      <p className="mt-2 text-sm text-[#05058a]/70">
                        When approved, you see exactly the actions the operator unlocked. Per action: decrypted reasoning blob,
                        hash verification result, the TEE attestation quote, and the full six-stage trace.
                      </p>
                    </div>
                  </section>

                  <section className="lg:col-span-5">
                    <div className="border border-[#05058a]/15 bg-[#f5f5f0] p-4">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-[#05058a]/60">
                        Export
                      </p>
                      <p className="mt-2 text-sm text-[#05058a]/70">
                        Export will download a signed audit report (JSON containing verified data + on-chain proof links).
                      </p>
                      <button
                        type="button"
                        className="mt-4 bg-[#05058a] px-5 py-3 text-[11px] uppercase tracking-[0.18em] text-white opacity-50"
                        disabled
                      >
                        Export audit report (coming soon)
                      </button>
                    </div>
                  </section>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

