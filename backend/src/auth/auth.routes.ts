import { Router, type Response } from "express";
import { prisma } from "../lib/prisma.js";
import { hashMasterPassword, verifyMasterPassword } from "./password.js";
import { signSession } from "./jwt.js";
import { MasterPasswordInput } from "./schemas.js";
import { requireAuth } from "../middleware/requireAuth.js";

export const authRouter = Router();

const SESSION_COOKIE = "session";
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

/** Issue a session token and set it as an httpOnly cookie. */
function setSessionCookie(res: Response, userId: string) {
  res.cookie(SESSION_COOKIE, signSession(userId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SEVEN_DAYS_MS,
    path: "/",
  });
}

/** Public: has the master password been set up yet? Drives the UI's first screen. */
authRouter.get("/status", async (_req, res) => {
  const count = await prisma.user.count();
  res.json({ setupComplete: count > 0 });
});

/** First-run only: establish the master password. Allowed once. Auto-logs in. */
authRouter.post("/setup", async (req, res) => {
  const parsed = MasterPasswordInput.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }
  if ((await prisma.user.count()) > 0) {
    return res.status(409).json({ error: "Already set up. Please log in." });
  }
  const masterHash = await hashMasterPassword(parsed.data.masterPassword);
  const user = await prisma.user.create({ data: { masterHash } });
  setSessionCookie(res, user.id);
  res.status(201).json({ ok: true });
});

/** Verify the master password and start a session. */
authRouter.post("/login", async (req, res) => {
  const parsed = MasterPasswordInput.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }
  const user = await prisma.user.findFirst();
  if (!user) {
    return res.status(404).json({ error: "Not set up yet." });
  }
  const ok = await verifyMasterPassword(user.masterHash, parsed.data.masterPassword);
  if (!ok) {
    return res.status(401).json({ error: "Incorrect master password." });
  }
  setSessionCookie(res, user.id);
  res.json({ ok: true });
});

/** End the session. */
authRouter.post("/logout", (_req, res) => {
  res.clearCookie(SESSION_COOKIE, { path: "/" });
  res.json({ ok: true });
});

/** Protected: who am I? Confirms the requireAuth guard works. */
authRouter.get("/me", requireAuth, (req, res) => {
  res.json({ userId: req.userId });
});
