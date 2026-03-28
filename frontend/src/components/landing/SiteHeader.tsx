const nav = [
  { href: "#pipeline", label: "Pipeline" },
  { href: "#architecture", label: "Architecture" },
  { href: "#reveal", label: "Reveal" },
  { href: "#sponsors", label: "Integrations" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <a href="#" className="font-mono text-sm font-semibold tracking-tight text-zinc-100">
          SĒAL
        </a>
        <nav className="hidden items-center gap-8 sm:flex">
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm text-zinc-400 transition-colors hover:text-zinc-100"
            >
              {item.label}
            </a>
          ))}
        </nav>
        <a
          href="#reveal"
          className="rounded-full border border-teal-500/40 bg-teal-500/10 px-3 py-1.5 text-xs font-medium text-teal-300 transition-colors hover:bg-teal-500/20 sm:text-sm"
        >
          Demo
        </a>
      </div>
    </header>
  );
}
