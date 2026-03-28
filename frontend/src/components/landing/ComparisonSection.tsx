const rows = [
  { label: "Traditional DAO bots", v: false, p: null, b: false, a: false },
  { label: "Public IPFS audit logs", v: true, p: false, b: false, a: "~" as const },
  { label: "ZK-only approaches", v: true, p: true, b: false, a: false },
  { label: "SEAL", v: true, p: true, b: true, a: true, highlight: true },
];

function Cell({ ok }: { ok: boolean | "~" }) {
  if (ok === "~") return <span className="text-zinc-500">~</span>;
  return <span className={ok ? "text-teal-400" : "text-zinc-600"}>{ok ? "✓" : "✗"}</span>;
}

export function ComparisonSection() {
  return (
    <section className="border-b border-zinc-800/80 px-4 py-16 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-teal-400/90">Positioning</p>
        <h2 className="mt-3 max-w-2xl text-2xl font-semibold tracking-tight text-zinc-50 sm:text-3xl">
          Verifiable, private, bypass-proof, agent-native
        </h2>
        <div className="mt-10 overflow-x-auto rounded-2xl border border-zinc-800">
          <table className="w-full min-w-[520px] border-collapse text-center text-sm">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/50">
                <th className="px-3 py-3 text-left font-medium text-zinc-400" />
                <th className="px-3 py-3 font-medium text-zinc-300">Verifiable</th>
                <th className="px-3 py-3 font-medium text-zinc-300">Private</th>
                <th className="px-3 py-3 font-medium text-zinc-300">Bypass-proof</th>
                <th className="px-3 py-3 font-medium text-zinc-300">Agent-native</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.label}
                  className={
                    row.highlight
                      ? "border-t border-teal-500/30 bg-teal-950/20"
                      : "border-t border-zinc-800/80"
                  }
                >
                  <th className="px-3 py-3 text-left text-sm font-medium text-zinc-200">{row.label}</th>
                  <td className="px-3 py-3">
                    <Cell ok={row.v} />
                  </td>
                  <td className="px-3 py-3">{row.p == null ? "—" : <Cell ok={row.p} />}</td>
                  <td className="px-3 py-3">
                    <Cell ok={row.b} />
                  </td>
                  <td className="px-3 py-3">
                    <Cell ok={row.a} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
