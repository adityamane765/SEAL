import { DashboardNavbar } from "@/components/dashboard/DashboardNavbar";
import Link from "next/link";
import { BayerDitherImage } from "@/components/hero/BayerDitherImage";

export default function DashboardPage() {
  return (
    <div className="min-h-[100svh] w-full bg-[#f5f5f0] text-[#05058a]">
      <DashboardNavbar />
      <main className="mx-auto max-w-[1440px] px-6 pb-24 pt-28 md:pt-32">
        <div className="border border-[#05058a]/15 bg-white p-6">
          <p className="text-[11px] uppercase tracking-[0.22em] text-[#05058a]/65">
            SEAL console
          </p>
          <h1 className="mt-3 text-[clamp(34px,4.8vw,62px)] font-black leading-[0.95] tracking-[-0.03em] text-[#05058a]">
            Choose your role
          </h1>
          <p className="mt-4 max-w-[58rem] text-sm leading-relaxed text-[#05058a]/70">
            Pick the surface that matches what you’re doing right now.
          </p>

          <div className="mt-10 grid max-w-[1200px] gap-4 md:grid-cols-2">
            <Link
              href="/dashboard/operator"
              data-oci-cursor="on-dark"
              className="group relative aspect-[6/5] overflow-hidden border border-white/10 bg-[#05058a] p-6 transition-colors hover:bg-[#04046f] md:p-7"
            >
              <BayerDitherImage
                src="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&q=80&auto=format"
                alt="Operator console"
                className="absolute inset-0 h-full w-full opacity-[0.9] transition-opacity duration-300 ease-in-out group-hover:opacity-[0.98]"
              />
              <div className="pointer-events-none absolute inset-0 bg-[#05058a]/65 transition-colors duration-300 ease-in-out group-hover:bg-[#05058a]/55" />
              <div className="relative flex h-full flex-col justify-end">
                <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-white/70">
                  Path A
                </p>
                <p className="mt-3 text-3xl font-black tracking-[-0.02em] text-white md:text-[2.6rem]">
                  I’m an Operator
                </p>
                <p className="mt-3 text-sm leading-relaxed text-white/75">
                  Verify connectivity, wallet/network, and contract configuration before operating.
                </p>
              </div>
            </Link>

            <Link
              href="/dashboard/auditor"
              data-oci-cursor="on-dark"
              className="group relative aspect-[6/5] overflow-hidden border border-white/10 bg-[#05058a] p-6 transition-colors hover:bg-[#04046f] md:p-7"
            >
              <BayerDitherImage
                src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1200&q=80&auto=format"
                alt="Auditor review"
                className="absolute inset-0 h-full w-full opacity-[0.9] transition-opacity duration-300 ease-in-out group-hover:opacity-[0.98]"
              />
              <div className="pointer-events-none absolute inset-0 bg-[#05058a]/65 transition-colors duration-300 ease-in-out group-hover:bg-[#05058a]/55" />
              <div className="relative flex h-full flex-col justify-end">
                <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-white/70">
                  Path B
                </p>
                <p className="mt-3 text-3xl font-black tracking-[-0.02em] text-white md:text-[2.6rem]">
                  I’m an Auditor
                </p>
                <p className="mt-3 text-sm leading-relaxed text-white/75">
                  Review commitments and request selective reveals as an authorized party.
                </p>
              </div>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

