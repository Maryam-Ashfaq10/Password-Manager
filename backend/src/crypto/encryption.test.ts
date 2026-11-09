import { test } from "node:test";
import assert from "node:assert/strict";

// Set a known 32-byte key BEFORE importing the module's functions use it.
// getKey() reads process.env at call time, so setting it here is enough and
// keeps the test independent of the real .env file.
process.env.ENCRYPTION_KEY = "a".repeat(64); // 32 bytes of 0xaa, valid hex

const { encrypt, decrypt } = await import("./encryption.ts");

test("round-trips a normal password", () => {
  const secret = "Tr0ub4dor&3!";
  const enc = encrypt(secret);
  assert.equal(decrypt(enc), secret);
});

test("round-trips unicode and emoji", () => {
  const secret = "p@ss—wörd—🔐—密码";
  assert.equal(decrypt(encrypt(secret)), secret);
});

test("round-trips an empty string", () => {
  assert.equal(decrypt(encrypt("")), "");
});

test("produces hex ciphertext, iv, and tag", () => {
  const { ciphertext, iv, tag } = encrypt("hello");
  const isHex = (s: string) => /^[0-9a-f]*$/.test(s);
  assert.ok(isHex(ciphertext) && isHex(iv) && isHex(tag));
  assert.equal(iv.length, 24, "12-byte IV = 24 hex chars");
  assert.equal(tag.length, 32, "16-byte GCM tag = 32 hex chars");
});

test("uses a fresh IV each time (non-deterministic ciphertext)", () => {
  const a = encrypt("same input");
  const b = encrypt("same input");
  assert.notEqual(a.iv, b.iv);
  assert.notEqual(a.ciphertext, b.ciphertext);
  // ...yet both decrypt back to the same plaintext.
  assert.equal(decrypt(a), "same input");
  assert.equal(decrypt(b), "same input");
});

test("rejects tampered ciphertext (GCM authentication)", () => {
  const enc = encrypt("sensitive");
  // Flip the last hex nibble of the ciphertext.
  const last = enc.ciphertext.slice(-1);
  const flipped = last === "0" ? "1" : "0";
  const tampered = { ...enc, ciphertext: enc.ciphertext.slice(0, -1) + flipped };
  assert.throws(() => decrypt(tampered));
});

test("rejects a tampered auth tag", () => {
  const enc = encrypt("sensitive");
  const tampered = { ...enc, tag: "0".repeat(32) };
  assert.throws(() => decrypt(tampered));
});

test("fails to decrypt with the wrong key", () => {
  const enc = encrypt("secret under key A");
  process.env.ENCRYPTION_KEY = "b".repeat(64); // switch key
  assert.throws(() => decrypt(enc));
  process.env.ENCRYPTION_KEY = "a".repeat(64); // restore for later tests
});

test("throws a clear error when the key is missing", () => {
  const saved = process.env.ENCRYPTION_KEY;
  delete process.env.ENCRYPTION_KEY;
  assert.throws(() => encrypt("x"), /ENCRYPTION_KEY is not set/);
  process.env.ENCRYPTION_KEY = saved;
});

test("throws when the key is the wrong length", () => {
  const saved = process.env.ENCRYPTION_KEY;
  process.env.ENCRYPTION_KEY = "abcd"; // too short
  assert.throws(() => encrypt("x"), /must be 32 bytes/);
  process.env.ENCRYPTION_KEY = saved;
});
