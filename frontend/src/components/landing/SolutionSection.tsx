export function SolutionSection() {
  return (
    <section className="border-b border-zinc-800/80 px-4 py-16 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-teal-400/90">The solution</p>
        <h2 className="mt-3 max-w-2xl text-2xl font-semibold tracking-tight text-zinc-50 sm:text-3xl">
          Commit · attest · execute — infrastructure, not a single product
        </h2>
        <div className="mt-8 max-w-3xl space-y-4 text-zinc-400 leading-relaxed">
          <p>
            SEAL is the <strong className="font-medium text-zinc-200">commit-attest-execute layer</strong> for
            AI agents. What gets committed on-chain is separated from what gets revealed and to whom —
            accountability and privacy together.
          </p>
          <p>
            The agent reasons inside a confidential enclave. A cryptographic commitment lands on-chain
            before execution. Reasoning stays private — authorized parties can request a verified reveal.
          </p>
          <p className="rounded-xl border border-teal-500/20 bg-teal-950/30 px-4 py-3 text-sm text-teal-100/90">
            One primitive: marketplaces, DAOs, trading desks, hiring pipelines, regulated decision systems —
            any system running agents can plug in SEAL as the trust layer underneath.
          </p>
        </div>
      </div>
    </section>
  );
}
