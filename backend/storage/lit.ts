import { createLitClient } from "@lit-protocol/lit-client";
import { nagaTest } from "@lit-protocol/networks";
import { generateSessionKeyPair } from "@lit-protocol/crypto";
import { ethers } from "ethers";
import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

let litClient: Awaited<ReturnType<typeof createLitClient>> | null = null;

async function getLit() {
  if (litClient) return litClient;
  litClient = await createLitClient({ network: nagaTest });
  return litClient;
}

function getSigner(pk?: string) {
  const key = pk ?? process.env.SIGNER_PRIVATE_KEY;
  if (!key) throw new Error("SIGNER_PRIVATE_KEY is required");
  return new ethers.Wallet(key);
}

function stakerCondition() {
  return [
    {
      conditionType: "evmContract" as const,
      contractAddress: process.env.CONTRACT_ADDRESS ?? "",
      chain: "baseSepolia" as const,
      functionName: "isRegisteredStaker",
      functionParams: [":userAddress"],
      functionAbi: {
        name: "isRegisteredStaker",
        type: "function",
        stateMutability: "view",
        inputs: [{ name: "account", type: "address", internalType: "address" }],
        outputs: [{ name: "", type: "bool", internalType: "bool" }],
      },
      returnValueTest: { key: "", comparator: "=" as const, value: "true" },
    },
  ];
}

async function makeAuthContext(signerPk?: string) {
  const signer = getSigner(signerPk);
  const sessionKeyPair = generateSessionKeyPair();
  const msg = `SEAL auth: ${Date.now()}`;
  const sig = await signer.signMessage(msg);

  return {
    chain: "baseSepolia",
    sessionKeyPair,
    authNeededCallback: async () => ({
      sig,
      derivedVia: "ethers",
      signedMessage: msg,
      address: signer.address,
    }),
  };
}

export interface EncryptedKey {
  ciphertext: string;
  dataToEncryptHash: string;
}

// Encrypt the AES key via Lit with staker access conditions.
// No auth needed at encrypt time — conditions are baked in.
export async function encryptBlobKey(aesKey: Buffer): Promise<EncryptedKey> {
  const lit = await getLit();

  const { ciphertext, dataToEncryptHash } = await lit.encrypt({
    dataToEncrypt: new Uint8Array(aesKey),
    evmContractConditions: stakerCondition(),
  });

  return { ciphertext, dataToEncryptHash };
}

// Decrypt the AES key — requester wallet checked against staker condition at decrypt time.
export async function decryptBlobKey(
  encryptedKey: EncryptedKey,
  requesterPk: string
): Promise<Buffer> {
  const lit = await getLit();
  const authContext = await makeAuthContext(requesterPk);

  const { decryptedData } = await lit.decrypt({
    data: {
      ciphertext: encryptedKey.ciphertext,
      dataToEncryptHash: encryptedKey.dataToEncryptHash,
    },
    evmContractConditions: stakerCondition(),
    authContext: authContext as any,
  });

  return Buffer.from(decryptedData);
}

// AES-256-GCM encrypt the raw reasoning blob from Dev B.
// Returns encrypted bytes (→ Filecoin), key + iv (→ encryptBlobKey / stored with CID record).
export function encryptBlob(blob: string): { encrypted: Buffer; key: Buffer; iv: Buffer } {
  const key = randomBytes(32);
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([
    cipher.update(blob, "utf8"),
    cipher.final(),
    cipher.getAuthTag(),
  ]);
  return { encrypted, key, iv };
}

// Decrypt blob after recovering AES key from Lit.
export function decryptBlob(encrypted: Buffer, key: Buffer, iv: Buffer): string {
  const authTag = encrypted.slice(-16);
  const data = encrypted.slice(0, -16);
  const decipher = createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(authTag);
  return decipher.update(data) + decipher.final("utf8");
}
