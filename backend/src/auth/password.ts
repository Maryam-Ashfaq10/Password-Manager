import { hash, verify, Algorithm } from "@node-rs/argon2";

// Master-password hashing with Argon2id — a memory-hard algorithm resistant to
// GPU/ASIC brute-forcing. We store only the hash (which embeds its own salt and
// parameters); the master password itself is never persisted.

const OPTIONS = { algorithm: Algorithm.Argon2id };

/** Hash a master password for storage. Returns a self-describing PHC string. */
export function hashMasterPassword(plaintext: string): Promise<string> {
  return hash(plaintext, OPTIONS);
}

/** Verify a candidate password against a stored hash. */
export function verifyMasterPassword(
  storedHash: string,
  candidate: string,
): Promise<boolean> {
  return verify(storedHash, candidate, OPTIONS);
}
