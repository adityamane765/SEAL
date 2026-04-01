# SEAL implementation status (`contracts/` + `backend/`)

Snapshot of what exists in the **smart contracts** and **Node backend**, what is **tested**, and what is **not wired** to the Next.js app or production infra. Last reviewed against the repo layout in **March 2026**.

---

## Contracts (`contracts/`)

### What exists

| Piece | Notes |
|--------|--------|
| **`SEAL.sol`** | UUPS-upgradeable (`Initializable`, `UUPSUpgradeable`, `OwnableUpgradeable`). Single main contract: agent registry + staking, commitments, execution, disputes, admin tuning. |
| **Agent registry** | `registerAgent(bytes32 agentId)` payable; `minStake` enforced; `registeredStakers` map set for Lit-style “staker” tracking. |
| **Commit / attest** | `submitCommitment(taskId, merkleRoot, attestationQuote, nonce, timestamp)` — stores quote bytes; `verifyAttestation` checks commitment exists and quote matches (length ≥ 64). **No** cryptographic verification of a real TEE quote on-chain (intentionally mock-friendly). |
| **Execute** | `executeTask(taskId, txData, executionHash, signature)` — marks executed, stores `executionHash`; does **not** cryptographically verify `signature` against execution (presence checks only). |
| **Disputes** | `raiseDispute`, `voteOnDispute`, `resolveDispute` with bond, deadline, vote tallies; slash or reject with ETH movements. `emergencySlash` (owner). |
| **Views** | `getCommitment`, `getDispute`, `getAgentTasks` (array exists; **not** populated in `registerAgent` / `submitCommitment` in the Solidity shown — mapping is unused for appends in contract body). |
| **`Deploy.s.sol`** | Deploys implementation + `ERC1967Proxy` with `initialize(minStake, disputeBond, disputePeriod)`. |
| **`Upgrade.s.sol`** | Present for UUPS upgrades (see script file). |

### What is verified to work

**Foundry tests** in `contracts/test/SEAL.t.sol` exercise:

- Agent registration (happy path + reverts).
- Commitment lifecycle + `verifyAttestation` + `executeTask` reverts.
- Full happy path: register → commit → execute.
- Dispute: raise, vote (including reverts), resolve (slash vs reject), emergency slash, `isPendingExecution`.
- Proxy ownership and initial config.

**How to confirm locally**

```text
cd contracts
forge build
forge test
```

### Gaps / caveats (contract layer)

- **Attestation “verification”** is byte-equality + minimum length, not Nitro/TDX verification.
- **`agentTasks`** is not written in the contract snippets reviewed — off-chain indexers would need another source unless extended later.
- **`voteOnDispute`** does not require `msg.sender` to be a registered agent/staker (comment in NatSpec differs from enforcement).
- **Deployed address** in `backend/src/contract-integration.ts` comments is documentation only; runtime uses **`CONTRACT_ADDRESS` in `.env`** (e.g. Ethereum Sepolia).

---

## Backend (`backend/`)

### What exists

| Piece | Notes |
|--------|--------|
| **`src/agent.ts`** | `SEALFluenceAgent`: input hashing, Claude (+ optional Gemini fallback) “reason in TEE”, mock enclave key material, `commitAndAttest`, `executeInTEE`, mock Nitro-style **base64** attestation quote (`aws-nitro-v1-mock`). |
| **`src/contract-integration.ts`** | Ethers `Contract` wrapper: `submitCommitment`, `verifyAttestation`, `executeAfterCommitment`, `getCommitmentStatus`. Exports **`SEAL_CONTRACT_ABI`** aligned with `SEAL.sol`. |
| **`src/server.ts`** | **Express** API: health, hashing, full pipeline, demos, chain helpers, disputes, reveal. |
| **`index.ts`** | Re-exports + optional **CLI** demo runner when invoked as main (needs real `ANTHROPIC_API_KEY` for real LLM calls). |
| **`storage/`** | `sealBlob` / `revealBlob`: encrypt blob, pin via Storacha/w3up, Lit key wrapping; `revealBlob` fetches CID from public gateways. Failures in pipeline often **logged and skipped** so HTTP still returns JSON. |
| **`aqua/seal.aqua` + `fluence.yaml` + `service/tee_service.rs`** | Fluence/Aqua/Marine-shaped **composition** and Rust service stub — parallel story to the TS runtime; not required for `npm start` if you only use the Express path. |
| **`package.json`** | `build` = `tsc`, `start` = `tsx src/server.ts`, `demo` = `tsx index.ts`. **`vitest`** is listed; **no `*.test.ts` files** were present in-tree at documentation time. |

### HTTP API (what works when env is set)

**Always (if LLM keys valid):**

- `GET /health`
- `POST /api/hash-inputs` — SHA-256 over canonical `TEEInput` JSON.
- `POST /api/pipeline` — reason → commit → optional storage → optional on-chain commit if contract + sealed blob OK → execute in memory; returns commitments, attestation, execution payload.
- `POST /api/pipeline-onchain` — requires **`RPC_URL`**, **`CONTRACT_ADDRESS`**, **`SIGNER_PRIVATE_KEY`**; runs pipeline and **always** submits `submitCommitment` then `executeTask` on-chain (differs from `/api/pipeline` which only commits on-chain when `sealContract && sealed`).
- `POST /api/demo/treasury`, `/api/demo/agent-to-agent`, `/api/demo/credential-proof` — vignette runners.
- `POST /api/verify-attestation` — parses base64 quote JSON and checks **mock** format fields.
- `POST /api/reveal` — Lit decrypt path + audit log (`cid`, `encryptedKey`, `iv`, `requesterPk`); **sensitive**: server accepts private key material (appropriate only for demo/dev).

**Only when `RPC_URL` + `CONTRACT_ADDRESS` + `SIGNER_PRIVATE_KEY` are set** (and not placeholder):

- `POST /api/chain/submit-commitment`
- `GET /api/chain/commitment/:taskId` — `taskId` is string; hashed with `ethers.id` to `bytes32`.
- `GET /api/chain/stats`
- `POST /api/chain/execute-task`
- `POST /api/chain/dispute/raise` | `vote` | `resolve`
- `GET /api/chain/dispute/:disputeId`

**Server startup:** exits with error if neither a real Anthropic key nor `GEMINI_API_KEY` is configured (placeholder check for `sk-ant-xxx`).

### Storage / Lit / Filecoin

- **Works** when credentials and network cooperate: `sealBlob` pins encrypted content and wraps keys with Lit.
- **Degrades gracefully:** pipeline continues if storage fails; `onChain` submission in `/api/pipeline` only runs when **both** `sealContract` and `sealed` succeeded (see `server.ts`).

### Gaps / caveats (backend layer)

- **No automated tests** in repo for HTTP or agent class (Vitest script present, no tests).
- **Chain + task identity:** string `taskId` from inputs is converted with `ethers.id` for RPC calls — must stay consistent everywhere (frontend, indexer, auditor scope).
- **Fluence README** describes a Rust service under `service/`; the **live demo path** is predominantly **TypeScript + Express**, not Aqua execution on Fluence network unless separately deployed.

---

## Cross-cutting: what does *not* exist yet

| Area | Status |
|------|--------|
| **Frontend ↔ backend** | Dashboards are largely **mock UI**; no guarantee of live calls to `server.ts` for register/monitor/audit flows without additional wiring. |
| **Auditor ↔ operator** | `Auditors_Dash` stores requests in **React state**; not on-chain or synced to `OperatorAuditTab` mock inbox. |
| **NEAR** | Narrative in UI/docs; **no NEAR contract** in this repo slice. |
| **Real TEE** | Mock attestation format; production Nitro/TDX verification not in Solidity. |

---

## Quick verification checklist

| Check | Command / action |
|--------|------------------|
| Contracts compile & test | `forge test` in `contracts/` |
| Backend typecheck | `npm run build` in `backend/` |
| API up | `npm start` in `backend/` + `GET /health` |
| On-chain demo | `CONTRACT_ADDRESS`, `RPC_URL`, `SIGNER_PRIVATE_KEY` + `POST /api/pipeline-onchain` or chain endpoints |

---

## Summary

- **Contracts:** Solid **Foundry-tested** UUPS `SEAL` with registry, commit/execute, disputes, and admin controls; **deploy script** included; semantics are **demo-grade** for attestation and execution verification.
- **Backend:** **Operational Express service** with LLM pipeline, optional **EVM JSON-RPC** integration via env (e.g. Ethereum Sepolia), optional **Lit + Storacha** sealing, and **dispute** + **reveal** APIs. **Fluence/Aqua** is present as **parallel** integration artifacts, not the single source of truth for the running server.
- **Product gap:** End-to-end **user-facing** operator/auditor flows remain **mostly UI + local state** until the frontend and persistence layers are connected to this backend and contract.
