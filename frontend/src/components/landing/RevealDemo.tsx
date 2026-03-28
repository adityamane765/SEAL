"use client";

import { useState } from "react";

const stages = [
  { id: "01", label: "Inputs attested" },
  { id: "02", label: "Reasoned in TEE" },
  { id: "03", label: "Committed + attested" },
  { id: "04", label: "Executed in TEE" },
  { id: "05", label: "Delivery committed" },
  { id: "06", label: "Blob on Storacha" },
];

export function RevealDemo() {
  const [revealed, setRevealed] = useState(false);

  return (
    <section id="reveal" className="scroll-mt-14 border-b border-zinc-800/80 px-4 py-16 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-teal-400/90">Selective reveal (mock)</p>
        <h2 className="mt-3 max-w-2xl text-2xl font-semibold tracking-tight text-zinc-50 sm:text-3xl">
          Authorized staker view
        </h2>
        <p className="mt-4 max-w-2xl text-zinc-400">
          UI sketch for Lit-gated decryption: verify the on-chain commitment against the revealed blob and TEE
          quote — no backend wired in this mock.
        </p>

        <div className="mt-10 grid gap-6 lg:grid-cols-5">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 lg:col-span-3">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="font-mono text-xs text-zinc-500">Agent</p>
                <p className="mt-1 text-lg font-medium text-zinc-100">Treasury Agent · demo</p>
                <p className="mt-1 text-sm text-zinc-500">Runtime hash · 0x9c4e…71a2 (mock)</p>
              </div>
              <span className="rounded-full border border-emerald-500/40 bg-emerald-950/40 px-2.5 py-1 text-xs font-medium text-emerald-400">
                Pipeline complete
              </span>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {stages.map((s) => (
                <span
                  key={s.id}
                  className="inline-flex items-center gap-1.5 rounded-full border border-zinc-700/80 bg-zinc-950/60 px-2.5 py-1 text-[11px] text-zinc-400"
                >
                  <span className="font-mono text-teal-500/90">{s.id}</span>
                  {s.label}
                </span>
              ))}
            </div>

            <dl className="mt-8 space-y-3 font-mono text-xs">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                <dt className="text-zinc-500">Commitment root</dt>
                <dd className="break-all text-zinc-300 sm:text-right">0x7a3f…e2c1 · seq #1842</dd>
              </div>
              <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                <dt className="text-zinc-500">Encrypted CID (Storacha)</dt>
                <dd className="break-all text-zinc-300 sm:text-right">bafybei…mock-reasoning-blob</dd>
              </div>
              <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                <dt className="text-zinc-500">TEE quote</dt>
                <dd className="text-teal-400/90 sm:text-right">valid structure (mock signer)</dd>
              </div>
            </dl>

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setRevealed((r) => !r)}
                className="rounded-full bg-teal-500 px-4 py-2 text-sm font-medium text-zinc-950 transition-opacity hover:opacity-90"
              >
                {revealed ? "Hide reveal" : "Request reveal (staker)"}
              </button>
              <span className="self-center text-xs text-zinc-600">Lit access condition · mock</span>
            </div>
          </div>

          <div className="rounded-2xl border border-dashed border-zinc-700 bg-zinc-950/40 p-6 lg:col-span-2">
            <p className="font-mono text-xs uppercase tracking-wider text-zinc-500">Verification</p>
            {revealed ? (
              <div className="mt-4 space-y-4 text-sm">
                <div className="rounded-lg border border-emerald-500/30 bg-emerald-950/30 px-3 py-2 text-emerald-200/90">
                  ✓ Merkle root matches on-chain commitment
                </div>
                <div className="rounded-lg border border-emerald-500/30 bg-emerald-950/30 px-3 py-2 text-emerald-200/90">
                  ✓ TEE attestation covers execution hash
                </div>
                <pre className="max-h-48 overflow-auto rounded-lg border border-zinc-800 bg-black/40 p-3 text-[11px] leading-relaxed text-zinc-400">
                  {`{\n  "decision": "approve_transfer",\n  "amount": "12500",\n  "token": "USDC",\n  "inputs_hash": "0x1a…",\n  "rationale": "Within policy; …"\n}`}
                </pre>
              </div>
            ) : (
              <p className="mt-4 text-sm leading-relaxed text-zinc-500">
                Encrypted reasoning and execution payloads stay off-chain until an authorized wallet satisfies
                Lit conditions — then decrypt and diff against the committed root.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
