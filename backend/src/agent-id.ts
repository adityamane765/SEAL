import { type Address, encodePacked, keccak256, stringToBytes } from "viem";

/**
 * Deterministic agent id (bytes32) shared by operator dashboard + backend pipeline.
 * Must match `frontend/src/lib/agent-id.ts`.
 */
export function computeAgentIdBytes32(operatorAddress: Address, runtimeHash: string): `0x${string}` {
  const rh = runtimeHash.trim();
  const runtimeDigest = keccak256(stringToBytes(rh));
  return keccak256(
    encodePacked(["string", "address", "bytes32"], ["SEAL_AGENT_V1", operatorAddress, runtimeDigest])
  );
}
