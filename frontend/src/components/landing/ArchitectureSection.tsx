const layers = [
  {
    layer: "Runtime",
    component: "TEE agent runtime",
    role:
      "TypeScript agent in AWS Nitro Enclave: LLM, reasoning validation, blob encryption, attestation.",
  },
  {
    layer: "Staking",
    component: "Runtime verification stake",
    role:
      "Agents register via NEAR credential NFT tied to runtime hash — bad actors lose market access and stake.",
  },
  {
    layer: "Contract",
    component: "SEAL smart contract (EVM)",
    role:
      "Solidity on Base / Arbitrum: commit-before-execute, merkle roots, attestation validation, proposals.",
  },
  {
    layer: "Storage",
    component: "Encrypted IPFS layer",
    role:
      "Reasoning blobs encrypted (AES-256), pinned to Filecoin / Storacha; Lit manages decryption keys.",
  },
  {
    layer: "Vault",
    component: "Credential vault",
    role: "Agent API keys in Lit — prove tool access without exposing credentials to others.",
  },
  {
    layer: "Reveal",
    component: "Selective reveal UI",
    role:
      "Authorized parties request decryption, verify on-chain commitment vs blob, confirm TEE attestation.",
  },
];

export function ArchitectureSection() {
  return (
    <section id="architecture" className="scroll-mt-14 border-b border-zinc-800/80 px-4 py-16 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-teal-400/90">Architecture</p>
        <h2 className="mt-3 max-w-2xl text-2xl font-semibold tracking-tight text-zinc-50 sm:text-3xl">
          Stack at a glance
        </h2>
        <div className="mt-10 overflow-x-auto rounded-2xl border border-zinc-800">
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/50">
                <th className="px-4 py-3 font-medium text-zinc-300">Layer</th>
                <th className="px-4 py-3 font-medium text-zinc-300">Component</th>
                <th className="px-4 py-3 font-medium text-zinc-300">Role</th>
              </tr>
            </thead>
            <tbody>
              {layers.map((row) => (
                <tr key={row.component} className="border-b border-zinc-800/80 last:border-0">
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-teal-400/90">
                    {row.layer}
                  </td>
                  <td className="px-4 py-3 font-medium text-zinc-200">{row.component}</td>
                  <td className="px-4 py-3 text-zinc-500">{row.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
