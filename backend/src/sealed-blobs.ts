import { readJson, writeJson } from './persistence/json-store.js';

export type SealedBlobEntry = {
  agentIdBytes32: string;
  taskId: string;
  cid: string;
  encryptedKey: { ciphertext: string; dataToEncryptHash: string };
  iv: string;
  createdAt: string;
};

const FILE = 'sealed-blobs.json';

export function appendSealedBlob(entry: SealedBlobEntry): void {
  const list = readJson<SealedBlobEntry[]>(FILE, []);
  list.push(entry);
  writeJson(FILE, list);
}

export function sealedForAgent(agentIdBytes32: string): SealedBlobEntry[] {
  const lower = agentIdBytes32.toLowerCase();
  return readJson<SealedBlobEntry[]>(FILE, []).filter((e) => e.agentIdBytes32.toLowerCase() === lower);
}
