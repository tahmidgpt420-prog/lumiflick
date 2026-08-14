import crypto from 'node:crypto';

/**
 * Server-side admin session handling.
 *
 * Sessions are a signed, tamper-proof cookie value: `${payloadB64}.${hmacB64}`.
 * There is no server-side session store — validity is entirely determined by
 * the signature and the embedded expiry, so this file must never run in the
 * browser (it reads ADMIN_SESSION_SECRET, which is not a NEXT_PUBLIC_ var).
 */

export const ADMIN_SESSION_COOKIE = 'lf_admin_session';
export const SESSION_TTL_MS = 3 * 60 * 60 * 1000; // 3 hours

interface SessionPayload {
  sub: string; // admin username
  iat: number;
  exp: number;
}

function getSessionSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      'ADMIN_SESSION_SECRET is missing or too short. Set a 32+ char random value in .env.local.'
    );
  }
  return secret;
}

function b64url(input: Buffer | string): string {
  return Buffer.from(input).toString('base64url');
}

function sign(payload: string): string {
  return crypto.createHmac('sha256', getSessionSecret()).update(payload).digest('base64url');
}

export function createSessionToken(username: string): string {
  const now = Date.now();
  const payload: SessionPayload = { sub: username, iat: now, exp: now + SESSION_TTL_MS };
  const payloadB64 = b64url(JSON.stringify(payload));
  return `${payloadB64}.${sign(payloadB64)}`;
}

/** Verifies signature + expiry. Returns the payload if valid, otherwise null. */
export function verifySessionToken(token: string | undefined | null): SessionPayload | null {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [payloadB64, signature] = parts;

  let expected: string;
  try {
    expected = sign(payloadB64);
  } catch {
    return null;
  }

  const sigBuf = Buffer.from(signature);
  const expectedBuf = Buffer.from(expected);
  if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf-8')) as SessionPayload;
    if (typeof payload.exp !== 'number' || Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

/** Constant-time check of the submitted username against ADMIN_USERNAME. */
export function verifyUsername(candidate: string): boolean {
  const expected = process.env.ADMIN_USERNAME;
  if (!expected) return false;
  const a = Buffer.from(candidate);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

/** Verifies a plaintext password against the scrypt hash in ADMIN_PASSWORD_HASH. */
export function verifyPassword(candidate: string): boolean {
  const stored = process.env.ADMIN_PASSWORD_HASH;
  if (!stored || !stored.includes(':')) return false;
  const [salt, hashHex] = stored.split(':');
  const candidateHash = crypto.scryptSync(candidate, salt, 64);
  const storedHash = Buffer.from(hashHex, 'hex');
  if (candidateHash.length !== storedHash.length) return false;
  return crypto.timingSafeEqual(candidateHash, storedHash);
}
