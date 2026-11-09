import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

// Authenticated encryption for secret fields (passwords, notes) at rest.
//
// Algorithm: AES-256-GCM.
//  - 256-bit key, read from the ENCRYPTION_KEY env var (64 hex chars = 32 bytes).
//  - 96-bit (12-byte) random IV per encryption — the recommended size for GCM.
//  - GCM auth tag detects any tampering with the stored ciphertext.
//
// Each call uses a fresh random IV, so encrypting the same value twice yields
// different ciphertext. The IV and tag are not secret and are stored alongside
// the ciphertext; the key is what must stay secret.

const ALGORITHM = "aes-256-gcm";
const IV_BYTES = 12;
const KEY_BYTES = 32;

/** An encrypted value, ready to persist. All fields are hex-encoded. */
export interface EncryptedField {
  ciphertext: string;
  iv: string;
  tag: string;
}

/**
 * Load and validate the encryption key from the environment at call time.
 * Throws a clear error if it is missing or the wrong length, so a
 * misconfigured deployment fails loudly instead of corrupting data.
 */
function getKey(): Buffer {
  const hex = process.env.ENCRYPTION_KEY;
  if (!hex) {
    throw new Error(
      "ENCRYPTION_KEY is not set. Generate one with: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\"",
    );
  }
  const key = Buffer.from(hex, "hex");
  if (key.length !== KEY_BYTES) {
    throw new Error(
      `ENCRYPTION_KEY must be ${KEY_BYTES} bytes (${KEY_BYTES * 2} hex chars); got ${key.length} bytes.`,
    );
  }
  return key;
}

/** Encrypt a UTF-8 string into ciphertext + iv + tag (all hex). */
export function encrypt(plaintext: string): EncryptedField {
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv(ALGORITHM, getKey(), iv);
  const ciphertext = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  return {
    ciphertext: ciphertext.toString("hex"),
    iv: iv.toString("hex"),
    tag: cipher.getAuthTag().toString("hex"),
  };
}

/**
 * Decrypt a value produced by `encrypt`. Throws if the key is wrong or the
 * data has been tampered with (GCM authentication failure).
 */
export function decrypt(field: EncryptedField): string {
  const decipher = createDecipheriv(
    ALGORITHM,
    getKey(),
    Buffer.from(field.iv, "hex"),
  );
  decipher.setAuthTag(Buffer.from(field.tag, "hex"));
  const plaintext = Buffer.concat([
    decipher.update(Buffer.from(field.ciphertext, "hex")),
    decipher.final(),
  ]);
  return plaintext.toString("utf8");
}
