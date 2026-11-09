import { Router } from "express";
import type { Credential } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { encrypt, decrypt } from "../crypto/encryption.js";
import {
  CreateCredentialInput,
  UpdateCredentialInput,
  SearchQuery,
} from "./schemas.js";

// All routes here are mounted behind requireAuth, so req.userId is always set.
export const credentialsRouter = Router();

/** Safe shape for lists — never includes the password. */
function toListItem(c: Credential) {
  return {
    id: c.id,
    website: c.website,
    url: c.url,
    username: c.username,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
  };
}

/** Full detail — decrypts the password (and notes) for a single record. */
function toDetail(c: Credential) {
  return {
    ...toListItem(c),
    password: decrypt({
      ciphertext: c.passwordEnc,
      iv: c.passwordIv,
      tag: c.passwordTag,
    }),
    notes:
      c.notesEnc && c.notesIv && c.notesTag
        ? decrypt({ ciphertext: c.notesEnc, iv: c.notesIv, tag: c.notesTag })
        : null,
  };
}

/** GET /api/credentials?q= — list, with optional search over website + username. */
credentialsRouter.get("/", async (req, res) => {
  const parsed = SearchQuery.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid query." });
  }
  const q = parsed.data.q?.trim();
  const where = {
    userId: req.userId!,
    ...(q
      ? {
          OR: [
            { website: { contains: q } },
            { username: { contains: q } },
          ],
        }
      : {}),
  };
  const rows = await prisma.credential.findMany({
    where,
    orderBy: { website: "asc" },
  });
  res.json(rows.map(toListItem));
});

/** GET /api/credentials/:id — retrieve one, with the decrypted password. */
credentialsRouter.get("/:id", async (req, res) => {
  const row = await prisma.credential.findFirst({
    where: { id: req.params.id, userId: req.userId! },
  });
  if (!row) return res.status(404).json({ error: "Credential not found." });
  res.json(toDetail(row));
});

/** POST /api/credentials — create a new entry. */
credentialsRouter.post("/", async (req, res) => {
  const parsed = CreateCredentialInput.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }
  const { website, username, password, url, notes } = parsed.data;
  const pw = encrypt(password);
  const nt = notes ? encrypt(notes) : null;

  const row = await prisma.credential.create({
    data: {
      userId: req.userId!,
      website,
      username,
      url: url || null,
      passwordEnc: pw.ciphertext,
      passwordIv: pw.iv,
      passwordTag: pw.tag,
      notesEnc: nt?.ciphertext ?? null,
      notesIv: nt?.iv ?? null,
      notesTag: nt?.tag ?? null,
    },
  });
  res.status(201).json(toListItem(row));
});

/** PUT /api/credentials/:id — partial update. */
credentialsRouter.put("/:id", async (req, res) => {
  const parsed = UpdateCredentialInput.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }
  // Ownership check before mutating.
  const existing = await prisma.credential.findFirst({
    where: { id: req.params.id, userId: req.userId! },
  });
  if (!existing) return res.status(404).json({ error: "Credential not found." });

  const { website, username, password, url, notes } = parsed.data;
  const data: Record<string, unknown> = {};
  if (website !== undefined) data.website = website;
  if (username !== undefined) data.username = username;
  if (url !== undefined) data.url = url || null;

  if (password !== undefined) {
    const pw = encrypt(password);
    data.passwordEnc = pw.ciphertext;
    data.passwordIv = pw.iv;
    data.passwordTag = pw.tag;
  }
  if (notes !== undefined) {
    if (notes === "") {
      data.notesEnc = data.notesIv = data.notesTag = null;
    } else {
      const nt = encrypt(notes);
      data.notesEnc = nt.ciphertext;
      data.notesIv = nt.iv;
      data.notesTag = nt.tag;
    }
  }

  const row = await prisma.credential.update({
    where: { id: existing.id },
    data,
  });
  res.json(toListItem(row));
});

/** DELETE /api/credentials/:id */
credentialsRouter.delete("/:id", async (req, res) => {
  const result = await prisma.credential.deleteMany({
    where: { id: req.params.id, userId: req.userId! },
  });
  if (result.count === 0) {
    return res.status(404).json({ error: "Credential not found." });
  }
  res.json({ ok: true });
});
