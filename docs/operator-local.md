# Operator dashboard — local contract + backend

End-to-end flow: **deploy SEAL** → **register agent in the UI** → **backend reads the same contract** for the monitor tab.

## 1. Local chain (Anvil)

With [Foundry](https://book.getfoundry.sh/) installed:

```bash
anvil
```

Deploy (separate terminal, from `contracts/`).

**Hardhat** (Node + `npm install` in `contracts/`):

```bash
cd contracts
npx hardhat run scripts/deploy-sepolia.js --network localhost
```

**Foundry**:

```bash
cd contracts
forge script script/Deploy.s.sol:DeploySEAL --rpc-url http://127.0.0.1:8545 --broadcast
```

Copy the **proxy** address from the output.

## 2. Backend (`backend/`)

Create `.env`:

```env
ANTHROPIC_API_KEY=sk-ant-...
RPC_URL=http://127.0.0.1:8545
CONTRACT_ADDRESS=0x...your_proxy...
SIGNER_PRIVATE_KEY=0x...one_of_anvil_private_keys...
```

- `SIGNER_PRIVATE_KEY` is required for `POST /api/pipeline-onchain` and other **write** routes. For **read-only** monitor data (`GET /api/agents/...`, `GET /api/chain/stats`), RPC + `CONTRACT_ADDRESS` are enough.

```bash
cd backend
npm install
npm start
```

API: `http://localhost:3001` (default).

## 3. Frontend (`frontend/`)

Create `.env.local`:

```env
NEXT_PUBLIC_SEAL_CONTRACT_ADDRESS=0x...same_proxy...
NEXT_PUBLIC_SEAL_API_URL=http://localhost:3001
NEXT_PUBLIC_USE_LOCAL_CHAIN=true
```

```bash
cd frontend
npm install
npm run dev
```

Open the operator dashboard, connect MetaMask to **Localhost 8545** (chain id **31337**), import an Anvil account with ETH, then complete **Register agent** (step 6 submits `registerAgent`).

## 4. Linking backend pipeline to the same agent

The UI derives `agentId` (bytes32) as `keccak256(encodePacked("SEAL_AGENT_V1", operatorAddress, keccak256(runtimeHash)))`, matching `backend/src/agent-id.ts`.

When calling `POST /api/pipeline` or `POST /api/pipeline-onchain`, pass:

- `operatorAddress` — same wallet as registration  
- `runtimeHash` — same string as in the wizard  
- or `agentIdBytes32` explicitly  

so on-chain `submitCommitment` uses the **registered** agent and appends the task to `getAgentTasks(agentId)`.

## 5. Ethereum Sepolia instead of Anvil

Omit `NEXT_PUBLIC_USE_LOCAL_CHAIN` (or set to `false`). Deploy to Sepolia with **Hardhat** (`cd contracts && npm run deploy:sepolia` after `contracts/.env` has `PRIVATE_KEY` + `SEPOLIA_RPC_URL`) or **Foundry** (`forge script ... --rpc-url $SEPOLIA_RPC_URL`). Set `NEXT_PUBLIC_SEAL_CONTRACT_ADDRESS`, `NEXT_PUBLIC_SEPOLIA_RPC_URL` (optional; defaults to a public Sepolia RPC), plus backend `RPC_URL` / `CONTRACT_ADDRESS` to **Ethereum Sepolia** (chain id 11155111), not Base Sepolia.
