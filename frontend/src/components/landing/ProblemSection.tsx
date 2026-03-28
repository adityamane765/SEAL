const gaps = [
  {
    title: "Poisoned inputs",
    body:
      "No standard for proving what data an agent saw before reasoning. Tamper inputs and correct logic on top is meaningless.",
  },
  {
    title: "Opacity",
    body:
      "No proof of what an agent decided before execution — a bot can bypass logic and call contracts directly.",
  },
  {
    title: "Execution drift",
    body:
      "Reasoning may be verified, but a compromised runtime can still act differently from what it reasoned.",
  },
  {
    title: "Delivery risk",
    body:
      "Signed txs pass through relayers; drops, delays, or substitution break accountability at the last step.",
  },
  {
    title: "Publicity",
    body:
      "Public audit trails leak strategy. Accountability and privacy look fundamentally at odds.",
  },
];

export function ProblemSection() {
  return (
    <section className="border-b border-zinc-800/80 px-4 py-16 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-teal-400/90">The problem</p>
        <h2 className="mt-3 max-w-2xl text-2xl font-semibold tracking-tight text-zinc-50 sm:text-3xl">
          Trust-me infrastructure for agentic economies
        </h2>
        <p className="mt-4 max-w-2xl text-zinc-400">
          Autonomous agents manage treasuries, trades, and coordination on-chain — yet infrastructure
          fails across five dimensions at once.
        </p>
        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {gaps.map((g) => (
            <li
              key={g.title}
              className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 shadow-sm shadow-black/20"
            >
              <h3 className="font-medium text-zinc-100">{g.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-500">{g.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
