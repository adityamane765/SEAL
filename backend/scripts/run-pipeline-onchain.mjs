/**
 * Smoke test: ensure agent is registered on Sepolia for (signer, runtime hash), then
 * POST /api/pipeline-onchain.
 *
 * Usage (from backend/): node scripts/run-pipeline-onchain.mjs
 * Env:
 *   PIPELINE_RUNTIME_HASH — must match operator wizard “runtime hash” exactly (default below)
 *   Optional CLI: node scripts/run-pipeline-onchain.mjs 0xYourExactRuntimeString
 *   SEAL_API_URL (default http://127.0.0.1:$PORT)
 *   SKIP_ENSURE_REGISTER=1 — skip on-chain registerAgent (only if already registered)
 */
import { config } from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { ethers } from "ethers";
import { encodePacked, keccak256, stringToBytes } from "viem";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, "..", ".env") });

const runtimeHash =
  (process.argv[2]?.startsWith("0x") ? process.argv[2].trim() : null) ||
  process.env.PIPELINE_RUNTIME_HASH?.trim() ||
  "0x78b1f08cb045792f";
const port = process.env.PORT || "3001";
const base = (process.env.SEAL_API_URL ?? `http://127.0.0.1:${port}`).replace(/\/$/, "");

const pk = process.env.SIGNER_PRIVATE_KEY?.trim();
const rpcUrl = process.env.RPC_URL?.trim();
const contractAddress = process.env.CONTRACT_ADDRESS?.trim();
if (!pk) {
  console.error("Set SIGNER_PRIVATE_KEY in backend/.env");
  process.exit(1);
}
if (!rpcUrl || !contractAddress) {
  console.error("Set RPC_URL and CONTRACT_ADDRESS in backend/.env");
  process.exit(1);
}

const wallet = new ethers.Wallet(pk.startsWith("0x") ? pk : `0x${pk}`);
const operatorAddress = wallet.address;

/** Same formula as backend/src/agent-id.ts + frontend agent-id.ts */
function computeAgentIdBytes32(address, rh) {
  const r = rh.trim();
  const runtimeDigest = keccak256(stringToBytes(r));
  return keccak256(encodePacked(["string", "address", "bytes32"], ["SEAL_AGENT_V1", address, runtimeDigest]));
}

const sealAbi = [
  "function agents(bytes32) view returns (bool registered, uint256 nonce, uint256 stake, bool slashed, address agentOwner)",
  "function minStake() view returns (uint256)",
  "function registerAgent(bytes32 agentId) payable",
];

async function ensureAgentRegistered() {
  if (process.env.SKIP_ENSURE_REGISTER === "1") {
    console.log("SKIP_ENSURE_REGISTER=1 — not calling registerAgent");
    return;
  }
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const signer = wallet.connect(provider);
  const seal = new ethers.Contract(contractAddress, sealAbi, signer);
  const agentId = computeAgentIdBytes32(operatorAddress, runtimeHash);
  const row = await seal.agents(agentId);
  const registered = Boolean(row[0]);
  if (registered) {
    console.log("Agent already registered for this wallet + runtime hash.");
    return;
  }
  const minStake = await seal.minStake();
  console.log("Registering agent on-chain (minStake wei):", minStake.toString());
  const tx = await seal.registerAgent(agentId, { value: minStake });
  console.log("registerAgent tx:", tx.hash);
  await tx.wait();
  console.log("Registered.");
}

await ensureAgentRegistered();

const agentIdForMonitor = computeAgentIdBytes32(operatorAddress, runtimeHash);
console.log("agentIdBytes32 (use in dashboard if wallet + hash do not match CLI signer):", agentIdForMonitor);

const taskId = `explorer-test-${Date.now()}`;

const body = {
  input: {
    taskId,
    agentId: "seal-smoke",
    nonce: 1,
    onChainState: { scenario: "pipeline smoke", network: "sepolia" },
    externalData: { instruction: "Propose one small concrete action for a treasury agent demo." },
    timestamp: Date.now(),
  },
  systemPrompt: `You are a SEAL agent. Respond with ONLY valid JSON (no markdown):
{"reasoning":"why you chose this","executionPlan":{"action":"demo","target":"0x0000000000000000000000000000000000000000","value":"0","calldata":"0x","gasLimit":21000}}`,
  authorizedAddress: operatorAddress,
  operatorAddress,
  runtimeHash,
};

console.log("POST", `${base}/api/pipeline-onchain`);
console.log("operatorAddress", operatorAddress);
console.log("runtimeHash", runtimeHash);
console.log("taskId", taskId);

const res = await fetch(`${base}/api/pipeline-onchain`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

const text = await res.text();
let json;
try {
  json = JSON.parse(text);
} catch {
  console.error(res.status, text);
  process.exit(1);
}

if (!res.ok) {
  console.error("Error:", json.error ?? text);
  process.exit(1);
}

const oc = json.onChain;
console.log("\nOK — on-chain:");
console.log("  commit tx:", oc?.commitTxHash);
console.log("  execute tx:", oc?.executeTxHash);
console.log("  contract: ", oc?.contractAddress);
console.log("\nOpen Sepolia explorer for execute tx to see TaskExecuted / contract interaction.");
