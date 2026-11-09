import type { Request, Response, NextFunction } from "express";
import { verifySession } from "../auth/jwt.js";

// Augment Express' Request so downstream handlers can read req.userId safely.
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

/**
 * Guard for protected routes. Reads the session cookie, verifies it, and
 * attaches the user id to the request. Responds 401 if missing/invalid.
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.session as string | undefined;
  if (!token) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  try {
    req.userId = verifySession(token);
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired session" });
  }
}
