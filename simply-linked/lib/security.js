'use strict';
// Security primitives: PHI encryption at rest, password hashing, tokens, TOTP (MFA).
// Uses only Node's built-in crypto module.
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

// ---------- Data encryption key (AES-256-GCM) ----------
let DATA_KEY = null;

function loadDataKey(dataDir) {
  const fromEnv = process.env.SL_DATA_KEY;
  if (fromEnv) {
    const k = Buffer.from(fromEnv, 'base64');
    if (k.length !== 32) throw new Error('SL_DATA_KEY must be 32 bytes, base64-encoded (openssl rand -base64 32)');
    DATA_KEY = k;
    return 'env';
  }
  if (process.env.NODE_ENV === 'production') {
    throw new Error('SL_DATA_KEY is required in production. Store it in your cloud key manager / secret store, never in the database folder.');
  }
  // Development only: keep a local key file next to the database.
  const keyFile = path.join(dataDir, 'dev-data-key');
  if (!fs.existsSync(keyFile)) {
    fs.writeFileSync(keyFile, crypto.randomBytes(32).toString('base64'), { mode: 0o600 });
  }
  DATA_KEY = Buffer.from(fs.readFileSync(keyFile, 'utf8').trim(), 'base64');
  return 'dev-file';
}

function encrypt(plain) {
  if (plain === null || plain === undefined) return null;
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', DATA_KEY, iv);
  const ct = Buffer.concat([cipher.update(String(plain), 'utf8'), cipher.final()]);
  return 'v1:' + Buffer.concat([iv, cipher.getAuthTag(), ct]).toString('base64');
}

function decrypt(blob) {
  if (blob === null || blob === undefined) return null;
  if (!blob.startsWith('v1:')) throw new Error('Unknown ciphertext format');
  const raw = Buffer.from(blob.slice(3), 'base64');
  const decipher = crypto.createDecipheriv('aes-256-gcm', DATA_KEY, raw.subarray(0, 12));
  decipher.setAuthTag(raw.subarray(12, 28));
  return Buffer.concat([decipher.update(raw.subarray(28)), decipher.final()]).toString('utf8');
}

// ---------- Passwords (scrypt) ----------
const SCRYPT = { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };

function hashPassword(pw) {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(pw, salt, 64, SCRYPT);
  return `scrypt$${salt.toString('base64')}$${hash.toString('base64')}`;
}

function verifyPassword(pw, stored) {
  if (!stored || !stored.startsWith('scrypt$')) return false;
  const [, s, h] = stored.split('$');
  const expected = Buffer.from(h, 'base64');
  const actual = crypto.scryptSync(pw, Buffer.from(s, 'base64'), expected.length, SCRYPT);
  return crypto.timingSafeEqual(expected, actual);
}

// A fixed hash used to spend equal time when the email doesn't exist (avoids user enumeration).
const DUMMY_HASH = hashPassword(crypto.randomBytes(16).toString('hex'));

function passwordProblem(pw) {
  if (typeof pw !== 'string' || pw.length < 12) return 'Password must be at least 12 characters.';
  if (pw.length > 200) return 'Password is too long.';
  if (!/[A-Za-z]/.test(pw) || !/[0-9]/.test(pw)) return 'Password must include letters and numbers.';
  return null;
}

// ---------- Tokens ----------
const randomToken = (bytes = 32) => crypto.randomBytes(bytes).toString('base64url');
const sha256 = (s) => crypto.createHash('sha256').update(s).digest('hex');

// ---------- TOTP (RFC 6238), works with Google/Microsoft Authenticator, Authy, 1Password ----------
const B32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

function base32Encode(buf) {
  let bits = 0, value = 0, out = '';
  for (const byte of buf) {
    value = (value << 8) | byte; bits += 8;
    while (bits >= 5) { out += B32[(value >>> (bits - 5)) & 31]; bits -= 5; }
  }
  if (bits > 0) out += B32[(value << (5 - bits)) & 31];
  return out;
}

function base32Decode(str) {
  const clean = str.replace(/[\s=]/g, '').toUpperCase();
  let bits = 0, value = 0; const out = [];
  for (const ch of clean) {
    const i = B32.indexOf(ch);
    if (i < 0) throw new Error('bad base32');
    value = (value << 5) | i; bits += 5;
    if (bits >= 8) { out.push((value >>> (bits - 8)) & 255); bits -= 8; }
  }
  return Buffer.from(out);
}

function totpAt(secretB32, step) {
  const msg = Buffer.alloc(8);
  msg.writeBigUInt64BE(BigInt(step));
  const hmac = crypto.createHmac('sha1', base32Decode(secretB32)).update(msg).digest();
  const off = hmac[hmac.length - 1] & 15;
  const code = (hmac.readUInt32BE(off) & 0x7fffffff) % 1_000_000;
  return String(code).padStart(6, '0');
}

const newTotpSecret = () => base32Encode(crypto.randomBytes(20));

/** Returns the matched time step (for replay protection) or null. Allows ±1 step of clock drift. */
function verifyTotp(secretB32, code, lastStep = 0, now = Date.now()) {
  if (!/^\d{6}$/.test(String(code || ''))) return null;
  const step = Math.floor(now / 30000);
  for (const s of [step - 1, step, step + 1]) {
    if (s <= lastStep) continue;
    const a = Buffer.from(totpAt(secretB32, s)); const b = Buffer.from(String(code));
    if (crypto.timingSafeEqual(a, b)) return s;
  }
  return null;
}

module.exports = {
  loadDataKey, encrypt, decrypt,
  hashPassword, verifyPassword, DUMMY_HASH, passwordProblem,
  randomToken, sha256,
  newTotpSecret, verifyTotp, totpAt,
};
