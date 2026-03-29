<div align="center">

# User journeys — demo checklist

**SĒAL (Secure Enclave Agent Layer)** · PL Genesis · March 2026

Logic flows required for the hackathon demo, with status checkboxes.

</div>

---

## Table of contents

- [How to use this doc](#how-to-use-this-doc)
- [Cross-cutting: demo infrastructure](#cross-cutting-demo-infrastructure)
- [Journey 1 — DAO treasury agent](#journey-1--dao-treasury-agent)
- [Journey 2 — Agent-to-agent pipeline](#journey-2--agent-to-agent-pipeline)
- [Journey 3 — Credential-proof (Lit vault)](#journey-3--credential-proof-lit-vault)
- [Journey 4 — Stakeholder selective reveal](#journey-4--stakeholder-selective-reveal)

---

## How to use this doc

- **Checked (`[x]`)** — implemented or verified for the demo target you are tracking.
- **Unchecked (`[ ]` )** — not done yet; fill in as the build progresses.

Each journey maps to the **six-stage SEAL pipeline** described in the [README](../README.md) (attest inputs → reason in TEE → commit + attest → execute in TEE → guaranteed delivery → selective reveal). Code references: `backend/src/vignettes/` and `backend/src/server.ts`.

---

## Cross-cutting: demo infrastructure

| Step | Logic flow | Done |
|------|------------|------|
| C1 | Repository up to date; `backend/` and `contracts/` deps install (`npm install`, Foundry libs via submodules). | [ ] |
| C2 | `.env` / `backend/.env` aligned with `backend/.env.example` (EVM RPC, keys, Lit, Storacha, LLM keys as needed). | [ ] |
| C3 | SEAL contract deployed to chosen testnet; `SEAL_CONTRACT_ADDRESS` set. | [ ] |
| C4 | Agent registration path exercised (e.g. NEAR credential NFT / registry) if shown in demo. | [ ] |
| C5 | TEE runtime: mock attestation acceptable for demo per README disclosure; real Nitro/TDX if claiming production path. | [ ] |
| C6 | Backend demo server runs; health and vignette routes callable (`backend/src/server.ts`). | [ ] |
| C7 | CLI vignette runner works (`backend/index.ts`) for scripted recordings. | [ ] |
| C8 | Sponsor story clear: Lit (keys + access), Filecoin/Storacha (CIDs), NEAR (stake/registry), Flow (if micro-settlement shown). | [ ] |

---

## Journey 1 — DAO treasury agent

**Story:** A treasury agent reads DAO + market state, reasons in TEE, commits a reasoning root, then prepares execution consistent with that reasoning; stakeholders can later request selective reveal.

**Reference:** `TreasuryAgentDemo` in `backend/src/vignettes/treasury-agent.ts`.

| Step | Logic flow | Done |
|------|------------|------|
| 1.1 | **Attest inputs:** Build `TEEInput` with `onChainState` (DAO address, holdings, thresholds) and `externalData` (prices, volatility, gas). | [ ] |
| 1.2 | Hash / attest inputs before reasoning (input attestation visible in logs or UI). | [ ] |
| 1.3 | **Reason in TEE:** LLM call with treasury system prompt; structured JSON (`reasoning`, `executionPlan`). | [ ] |
| 1.4 | **Commit + attest:** `commitAndAttest` → merkle root, TEE quote snippet, nonce. | [ ] |
| 1.5 | **Execute in TEE:** `executeInTEE` → tx payload + execution attestation / execution hash. | [ ] |
| 1.6 | **Delivery:** Commit tx bytes or relayer path if applicable; show match to committed hash if in scope. | [ ] |
| 1.7 | **Selective reveal:** Encrypted blob + CID + Lit conditions referenced or simulated; auditor path narrated. | [ ] |
| 1.8 | **Demo wrap:** Show task id, input hash, reasoning hash, commitment root end-to-end. | [ ] |

---

## Journey 2 — Agent-to-agent pipeline

**Story:** Client agent scopes task and escrow; worker reasons and delivers; delivery is attested; client can dispute via reveal / slash narrative.

**Reference:** `AgentToAgentDemo` in `backend/src/vignettes/agent-to-agent.ts`.

| Step | Logic flow | Done |
|------|------------|------|
| 2.1 | **Phase A — Client:** Client `TEEInput` (task, payment, worker id, escrow). | [ ] |
| 2.2 | Client **reason + commit** (`reasonInTEE` → `commitAndAttest`); log client merkle root. | [ ] |
| 2.3 | **Phase B — Worker:** Worker `TEEInput` linked to pipeline / parent task. | [ ] |
| 2.4 | Worker **reason + commit** with deliverable / quality fields in structured output. | [ ] |
| 2.5 | **Phase C — Delivery:** `executeInTEE` for worker; execution attestation tied to delivery. | [ ] |
| 2.6 | **Phase D — Dispute / slash:** Slash or fraud narrative + optional `slashProof` object (reveal-based verification story). | [ ] |
| 2.7 | **Demo wrap:** Pipeline id, both commitments, delivery object, slash path explained. | [ ] |

---

## Journey 3 — Credential-proof (Lit vault)

**Story:** Agent proves access to a service using vault-backed credentials inside TEE—keys never exposed; attestation + Lit conditions for authorized reveal.

**Reference:** `CredentialProofDemo` in `backend/src/vignettes/credential-proof.ts`.

| Step | Logic flow | Done |
|------|------------|------|
| 3.1 | **Attest inputs:** `TEEInput` includes Lit vault ref, access conditions, credential hash (not the secret). | [ ] |
| 3.2 | **Reason in TEE:** LLM output proves credential access without key material. | [ ] |
| 3.3 | **Commit + attest:** Attestation + commitment for credential proof. | [ ] |
| 3.4 | **Execute in TEE:** Build access proof object (service, permission, execution hash, quote). | [ ] |
| 3.5 | **Lit conditions:** Document staker / auditor / multisig reveal conditions (demo may use placeholders). | [ ] |
| 3.6 | **Demo wrap:** `proofId`, access proof vs raw credential, verification story for a relying party. | [ ] |

---

## Journey 4 — Stakeholder selective reveal

**Story:** Authorized party verifies on-chain commitment against revealed blob and TEE quote (dashboard / UI or scripted walkthrough).

**Reference:** Architecture + Getting Started in [README](../README.md) (`npm run ui:dev`, commitment viewer components).

| Step | Logic flow | Done |
|------|------------|------|
| 4.1 | UI or script loads commitment record (merkle root, nonce) for a task. | [ ] |
| 4.2 | Authorized user triggers reveal (Lit decrypt path or mock). | [ ] |
| 4.3 | Hash match: revealed blob ↔ on-chain commitment; attestation quote inspected. | [ ] |
| 4.4 | Audit narrative: who may decrypt, when, and what proves non-repudiation. | [ ] |

---

<div align="center">

**SĒAL** · Secure Enclave Agent Layer

*Update checkboxes as demo milestones land.*

</div>
