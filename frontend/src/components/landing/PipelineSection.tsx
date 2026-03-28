const stages = [
  {
    n: "01",
    title: "Attest inputs",
    body:
      "On-chain state and external data is hashed before entering the TEE — proves what the agent was looking at, not only what it decided.",
  },
  {
    n: "02",
    title: "Reason in TEE",
    body:
      "LLM runs inside a TEE (e.g. AWS Nitro / Intel TDX). Reasoning never leaves the enclave in plaintext.",
  },
  {
    n: "03",
    title: "Commit + attest",
    body:
      "Merkle-batched hash of the reasoning blob on-chain with TEE attestation and sequence nonce — commitment provably precedes execution.",
  },
  {
    n: "04",
    title: "Execute in TEE",
    body:
      "Execution in the same TEE; action hashed into attestation — proves consistency with reasoning.",
  },
  {
    n: "05",
    title: "Guaranteed delivery",
    body:
      "Submit from the TEE where possible; otherwise exact tx bytes committed on-chain before relayer submission — deviation is detectable.",
  },
  {
    n: "06",
    title: "Selective reveal",
    body:
      "Encrypted blobs on Filecoin / Storacha; Lit controls access so stakers, regulators, or auditors decrypt and verify the full chain.",
  },
];

export function PipelineSection() {
  return (
    <section id="pipeline" className="scroll-mt-14 border-b border-zinc-800/80 px-4 py-16 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-teal-400/90">How it works</p>
        <h2 className="mt-3 max-w-2xl text-2xl font-semibold tracking-tight text-zinc-50 sm:text-3xl">
          Six-stage pipeline (contract-enforced)
        </h2>
        <p className="mt-4 max-w-2xl text-zinc-400">
          Every agent action follows this pipeline enforced by the SEAL smart contract.
        </p>
        <ol className="mt-12 space-y-0">
          {stages.map((s) => (
            <li
              key={s.n}
              className="relative flex gap-4 border-l border-zinc-800 pb-12 pl-8 last:border-l-transparent last:pb-0 sm:gap-6 sm:pl-10"
            >
              <span className="absolute -left-[13px] top-0 flex h-[26px] w-[26px] items-center justify-center rounded-full border border-teal-500/50 bg-zinc-950 font-mono text-[10px] font-semibold text-teal-400 sm:-left-[14px] sm:h-7 sm:w-7 sm:text-xs">
                {s.n}
              </span>
              <div className="min-w-0 flex-1 rounded-2xl border border-zinc-800 bg-zinc-900/30 p-5 sm:p-6">
                <h3 className="text-lg font-medium text-zinc-100">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-500">{s.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
