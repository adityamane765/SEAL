const cases = [
  {
    title: "DAO treasury",
    body:
      "Treasury agent proposes and executes on-chain actions. Stakers verify reasoning and trigger selective reveal on suspicion.",
  },
  {
    title: "Agent-to-agent",
    body:
      "Client agents prove workers reasoned before output; stake slashing if reveal shows fraudulent reasoning.",
  },
  {
    title: "Regulated industries",
    body:
      "Finance, healthcare, legal: auditable trails via Filecoin log — compliance without exposing proprietary strategy.",
  },
  {
    title: "Autonomous trading",
    body:
      "Commit reasoning hashes before each trade; regulators or counterparties investigate post-hoc without live strategy leakage.",
  },
];

export function UseCasesSection() {
  return (
    <section className="border-b border-zinc-800/80 px-4 py-16 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-teal-400/90">Use cases</p>
        <h2 className="mt-3 max-w-2xl text-2xl font-semibold tracking-tight text-zinc-50 sm:text-3xl">
          One primitive, every context
        </h2>
        <p className="mt-4 max-w-2xl text-zinc-400">
          SEAL is domain-agnostic: any system running AI agents gains verifiable reasoning with one integration.
        </p>
        <ul className="mt-12 grid gap-4 sm:grid-cols-2">
          {cases.map((c) => (
            <li
              key={c.title}
              className="rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900/80 to-zinc-950/80 p-6"
            >
              <h3 className="font-medium text-zinc-100">{c.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-500">{c.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
