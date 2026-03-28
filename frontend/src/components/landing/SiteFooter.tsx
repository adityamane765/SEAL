export function SiteFooter() {
  return (
    <footer className="px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6 text-sm leading-relaxed text-zinc-500">
          <p className="font-medium text-zinc-400">TEE disclosure</p>
          <p className="mt-2">
            Production uses AWS Nitro Enclaves or Intel TDX. Hackathon demo may use a mock attestation signer
            that emits correctly structured quotes — disclosed transparently; architecture remains valid.
          </p>
        </div>
        <p className="mt-8 text-center font-mono text-xs text-zinc-600">
          SĒAL · Secure Enclave Agent Layer · mockup UI
        </p>
      </div>
    </footer>
  );
}
