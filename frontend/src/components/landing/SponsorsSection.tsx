const sponsors = [
  {
    name: "Lit Protocol",
    body:
      "Decentralized keys for selective reveal and credential vault; multisig fallback for demo reliability.",
  },
  {
    name: "Filecoin / Storacha",
    body:
      "Permanent content-addressed storage for encrypted reasoning blobs and the full audit trail.",
  },
  {
    name: "NEAR Protocol",
    body: "Agent registry with runtime-verified staking; operator credential NFTs for bypass prevention.",
  },
  {
    name: "Flow",
    body: "High-throughput micro-settlement for per-task payments in multi-agent workflows.",
  },
];

export function SponsorsSection() {
  return (
    <section id="sponsors" className="scroll-mt-14 border-b border-zinc-800/80 px-4 py-16 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-teal-400/90">Sponsor integrations</p>
        <h2 className="mt-3 max-w-2xl text-2xl font-semibold tracking-tight text-zinc-50 sm:text-3xl">
          How SEAL uses each stack
        </h2>
        <ul className="mt-10 grid gap-4 sm:grid-cols-2">
          {sponsors.map((s) => (
            <li key={s.name} className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
              <h3 className="font-medium text-teal-300/95">{s.name}</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-500">{s.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
