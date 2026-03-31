import { createLitClient } from "@lit-protocol/lit-client";
import { nagaDev } from "@lit-protocol/networks";
import { generateSessionKeyPair } from "@lit-protocol/crypto";
import { ethers } from "ethers";
import { createCipheriv, createDecipheriv, randomBytes } from "crypto";
import { LIT_ABILITY } from "@lit-protocol/constants";

let litClient: Awaited<ReturnType<typeof createLitClient>> | null = null;

async function getLit() {
  if (litClient) return litClient;
  litClient = await createLitClient({ network: nagaDev });
  return litClient;
}

function getSigner(pk?: string) {
  const key = pk ?? process.env.SIGNER_PRIVATE_KEY;
  if (!key) throw new Error("SIGNER_PRIVATE_KEY is required");
  return new ethers.Wallet(key);
}

function stakerCondition(address: string) {
  return [
    {
      contractAddress: "",
      standardContractType: "" as const,
      chain: "baseSepolia" as const,
      method: "",
      parameters: [":userAddress"],
      returnValueTest: { comparator: "=" as const, value: address.toLowerCase() },
    },
  ];
}

export interface EncryptedKey {
  ciphertext: string;
  dataToEncryptHash: string;
}

export async function encryptBlobKey(aesKey: Buffer, ownerAddress: string): Promise<EncryptedKey> {
  const lit = await getLit();

  const { ciphertext, dataToEncryptHash } = await lit.encrypt({
    dataToEncrypt: new Uint8Array(aesKey),
    accessControlConditions: stakerCondition(ownerAddress),
  });

  return { ciphertext, dataToEncryptHash };
}

export async function decryptBlobKey(
  encryptedKey: EncryptedKey,
  requesterPk: string
): Promise<Buffer> {
  const lit = await getLit();
  const signer = getSigner(requesterPk);
  const sessionKeyPair = generateSessionKeyPair();
  const requesterAddress = signer.address;

  const { LitAccessControlConditionResource, createSiweMessageWithResources } =
    await import("@lit-protocol/auth-helpers");

  // Resource ID = hash(accessControlConditions) + "/" + dataToEncryptHash
  const accs = stakerCondition(requesterAddress);
  const resourceId = await LitAccessControlConditionResource.generateResourceString(
    accs,
    encryptedKey.dataToEncryptHash
  );
  const resource = new LitAccessControlConditionResource(resourceId);

  // authNeededCallback: SDK calls this to get a capability AuthSig
  // Must return an AuthSig whose signedMessage is a SIWE string with ReCap + Expiration Time
  const authNeededCallback = async () => {
    const siweMessage = await createSiweMessageWithResources({
      uri: `lit:session:${sessionKeyPair.publicKey}`,
      walletAddress: signer.address,
      nonce: randomBytes(16).toString("hex"),
      chainId: 84532,
      expiration: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
      resources: [
        { resource, ability: LIT_ABILITY.AccessControlConditionDecryption },
      ],
    });

    const sig = await signer.signMessage(siweMessage);
    return {
      sig,
      derivedVia: "web3.eth.personal.sign",
      signedMessage: siweMessage,
      address: signer.address,
    };
  };

  // PKPAuthContextSchema: { chain, sessionKeyPair, authNeededCallback, authConfig }
  // AuthConfigSchema fields all have defaults, but resources must match
  const authContext = {
    chain: "baseSepolia",
    sessionKeyPair,
    authNeededCallback,
    authConfig: {
      resources: [
        { resource, ability: LIT_ABILITY.AccessControlConditionDecryption },
      ],
    },
  };

  const { decryptedData } = await lit.decrypt({
    data: {
      ciphertext: encryptedKey.ciphertext,
      dataToEncryptHash: encryptedKey.dataToEncryptHash,
    },
    accessControlConditions: stakerCondition(requesterAddress),
    authContext,
  } as any);

  return Buffer.from(decryptedData);
}

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

export function decryptBlob(encrypted: Buffer, key: Buffer, iv: Buffer): string {
  const authTag = encrypted.slice(-16);
  const data = encrypted.slice(0, -16);
  const decipher = createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(authTag);
  return decipher.update(data) + decipher.final("utf8");
}
