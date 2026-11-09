import jwt from "jsonwebtoken";

// Session tokens. On login we issue a JWT whose `subject` is the user id, signed
// with JWT_SECRET. It is delivered to the browser as an httpOnly cookie, so
// client-side JavaScript can never read it.

const EXPIRES_IN = "7d";

function getSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error(
      "JWT_SECRET is not set. Generate one with: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\"",
    );
  }
  return secret;
}

/** Issue a signed session token for a user id. */
export function signSession(userId: string): string {
  return jwt.sign({}, getSecret(), { subject: userId, expiresIn: EXPIRES_IN });
}

/** Verify a session token and return the user id, or throw if invalid/expired. */
export function verifySession(token: string): string {
  const payload = jwt.verify(token, getSecret());
  if (typeof payload === "string" || !payload.sub) {
    throw new Error("Malformed session token");
  }
  return payload.sub as string;
}
