#!/usr/bin/env node
/**
 * Generates a scrypt hash for a new admin password.
 *
 * Usage:
 *   node scripts/hash-admin-password.mjs "your-new-password"
 *
 * Copy the printed ADMIN_PASSWORD_HASH value into .env.local (and your
 * hosting provider's env vars), then restart the app. The plaintext
 * password is never stored anywhere — only this hash is.
 */
import crypto from 'node:crypto';

const password = process.argv[2];

if (!password || password.length < 12) {
  console.error('Usage: node scripts/hash-admin-password.mjs "<password, 12+ chars>"');
  process.exit(1);
}

const salt = crypto.randomBytes(16).toString('hex');
const hash = crypto.scryptSync(password, salt, 64).toString('hex');

console.log(`ADMIN_PASSWORD_HASH=${salt}:${hash}`);
