export function Hero() {
  return (
    <section className="seal-grid relative overflow-hidden border-b border-zinc-800/80 px-4 py-20 sm:px-6 sm:py-28">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-teal-950/20 via-transparent to-transparent" />
      <div className="relative mx-auto max-w-6xl">
        <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-teal-400/90">
          PL Genesis · March 2026
        </p>
        <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight text-zinc-50 sm:text-5xl sm:leading-tight">
          SĒAL — Secure Enclave Agent Layer
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-zinc-400">
          Confidential, verifiable execution infrastructure for AI agents operating on-chain.
          Commit, attest, execute, deliver — with selective reveal when accountability matters.
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          <a
            href="#reveal"
            className="inline-flex items-center justify-center rounded-full bg-teal-500 px-5 py-2.5 text-sm font-medium text-zinc-950 transition-opacity hover:opacity-90"
          >
            View reveal mock
          </a>
          <a
            href="#pipeline"
            className="inline-flex items-center justify-center rounded-full border border-zinc-600 px-5 py-2.5 text-sm font-medium text-zinc-200 transition-colors hover:border-zinc-500 hover:bg-zinc-900/50"
          >
            Six-stage pipeline
          </a>
        </div>
      </div>
    </section>
  );
}
