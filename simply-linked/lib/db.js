'use strict';
// SQLite storage (Node built-in). PHI columns (*_enc) are AES-256-GCM encrypted before they reach the DB.
const { DatabaseSync } = require('node:sqlite');
const path = require('node:path');
const fs = require('node:fs');
const { sha256 } = require('./security');

function open(dataDir) {
  fs.mkdirSync(dataDir, { recursive: true, mode: 0o700 });
  const db = new DatabaseSync(path.join(dataDir, 'simply-linked.db'));
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS orgs (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      phone TEXT,
      verified INTEGER NOT NULL DEFAULT 0,
      fax TEXT,
      npi TEXT,
      address TEXT,
      claimed INTEGER NOT NULL DEFAULT 1,   -- 0 = added by a sender; nobody from this org has signed up yet
      no_fax INTEGER NOT NULL DEFAULT 0,    -- recipient asked us to stop fax notices
      active INTEGER NOT NULL DEFAULT 1,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY,
      org_id INTEGER NOT NULL REFERENCES orgs(id),
      email TEXT NOT NULL UNIQUE COLLATE NOCASE,
      name TEXT NOT NULL,
      title TEXT,
      role TEXT NOT NULL CHECK (role IN ('admin','member')),
      is_super INTEGER NOT NULL DEFAULT 0,
      pw_hash TEXT NOT NULL,
      totp_enc TEXT,
      totp_pending_enc TEXT,
      totp_last_step INTEGER NOT NULL DEFAULT 0,
      failed_logins INTEGER NOT NULL DEFAULT 0,
      locked_until INTEGER NOT NULL DEFAULT 0,
      active INTEGER NOT NULL DEFAULT 1,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS invites (
      token_hash TEXT PRIMARY KEY,
      org_id INTEGER NOT NULL REFERENCES orgs(id),
      email TEXT NOT NULL COLLATE NOCASE,
      role TEXT NOT NULL,
      created_by INTEGER NOT NULL REFERENCES users(id),
      created_at INTEGER NOT NULL,
      expires_at INTEGER NOT NULL,
      used_at INTEGER
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id_hash TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id),
      mfa_ok INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL,
      last_seen INTEGER NOT NULL,
      ip TEXT
    );

    -- A conversation between organizations (a shared inbox per org).
    CREATE TABLE IF NOT EXISTS threads (
      id INTEGER PRIMARY KEY,
      kind TEXT NOT NULL,
      urgent INTEGER NOT NULL DEFAULT 0,
      subject_enc TEXT NOT NULL,
      patient_enc TEXT,
      created_by INTEGER NOT NULL REFERENCES users(id),
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      closed_at INTEGER,
      closed_by INTEGER REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS thread_orgs (
      thread_id INTEGER NOT NULL REFERENCES threads(id),
      org_id INTEGER NOT NULL REFERENCES orgs(id),
      PRIMARY KEY (thread_id, org_id)
    );

    -- Messages are never edited or deleted (integrity of the care record).
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY,
      thread_id INTEGER NOT NULL REFERENCES threads(id),
      sender_id INTEGER NOT NULL REFERENCES users(id),
      sender_org_id INTEGER NOT NULL REFERENCES orgs(id),
      body_enc TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS messages_thread ON messages(thread_id, id);

    -- "Got it": an org confirms it has received everything up to a message.
    CREATE TABLE IF NOT EXISTS acks (
      id INTEGER PRIMARY KEY,
      thread_id INTEGER NOT NULL REFERENCES threads(id),
      org_id INTEGER NOT NULL REFERENCES orgs(id),
      user_id INTEGER NOT NULL REFERENCES users(id),
      upto_msg_id INTEGER NOT NULL,
      created_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS acks_thread ON acks(thread_id, org_id);

    CREATE TABLE IF NOT EXISTS reads (
      thread_id INTEGER NOT NULL REFERENCES threads(id),
      user_id INTEGER NOT NULL REFERENCES users(id),
      last_msg_id INTEGER NOT NULL,
      PRIMARY KEY (thread_id, user_id)
    );

    -- Append-only, hash-chained audit trail (HIPAA 164.312(b)). Never contains message content.
    CREATE TABLE IF NOT EXISTS audit (
      id INTEGER PRIMARY KEY,
      at INTEGER NOT NULL,
      user_id INTEGER,
      org_id INTEGER,
      action TEXT NOT NULL,
      target TEXT,
      ip TEXT,
      ok INTEGER NOT NULL DEFAULT 1,
      prev_hash TEXT NOT NULL,
      hash TEXT NOT NULL
    );
    -- Fax outreach: reach a pharmacy / DME / agency that is not on Simply Linked yet.
    -- The fax carries NO patient information, only "a secure message is waiting" + a one-time code.
    CREATE TABLE IF NOT EXISTS outreach (
      id INTEGER PRIMARY KEY,
      org_id INTEGER NOT NULL UNIQUE REFERENCES orgs(id),
      code_hash TEXT NOT NULL UNIQUE,
      code_enc TEXT NOT NULL,
      site_url TEXT NOT NULL,
      created_by INTEGER NOT NULL REFERENCES users(id),
      created_at INTEGER NOT NULL,
      last_fax_at INTEGER,
      fax_count INTEGER NOT NULL DEFAULT 0,
      opened_at INTEGER,
      claimed_at INTEGER,
      needs_call INTEGER NOT NULL DEFAULT 0,
      called_at INTEGER,
      called_by INTEGER REFERENCES users(id),
      call_note TEXT,
      expires_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS fax_log (
      id INTEGER PRIMARY KEY,
      outreach_id INTEGER NOT NULL REFERENCES outreach(id),
      to_fax TEXT NOT NULL,
      at INTEGER NOT NULL,
      kind TEXT NOT NULL,
      provider TEXT NOT NULL,
      ok INTEGER NOT NULL,
      detail TEXT
    );

    CREATE TRIGGER IF NOT EXISTS audit_no_update BEFORE UPDATE ON audit
      BEGIN SELECT RAISE(ABORT, 'audit log is append-only'); END;
    CREATE TRIGGER IF NOT EXISTS audit_no_delete BEFORE DELETE ON audit
      BEGIN SELECT RAISE(ABORT, 'audit log is append-only'); END;
  `);
  return db;
}

function auditHash(row, prev) {
  return sha256([prev, row.at, row.user_id ?? '', row.org_id ?? '', row.action, row.target ?? '', row.ip ?? '', row.ok].join('|'));
}

function makeAudit(db) {
  const last = db.prepare('SELECT hash FROM audit ORDER BY id DESC LIMIT 1');
  const ins = db.prepare('INSERT INTO audit (at,user_id,org_id,action,target,ip,ok,prev_hash,hash) VALUES (?,?,?,?,?,?,?,?,?)');
  return function audit({ user, action, target = null, ip = null, ok = true }) {
    const prev = last.get()?.hash || 'GENESIS';
    const row = { at: Date.now(), user_id: user?.id ?? null, org_id: user?.org_id ?? null, action, target: target === null ? null : String(target), ip, ok: ok ? 1 : 0 };
    ins.run(row.at, row.user_id, row.org_id, row.action, row.target, row.ip, row.ok, prev, auditHash(row, prev));
  };
}

/** Recomputes the hash chain. Returns { ok, checked, brokenAt }. */
function verifyAuditChain(db) {
  let prev = 'GENESIS', n = 0;
  for (const r of db.prepare('SELECT * FROM audit ORDER BY id').all()) {
    if (r.prev_hash !== prev || auditHash(r, prev) !== r.hash) return { ok: false, checked: n, brokenAt: r.id };
    prev = r.hash; n++;
  }
  return { ok: true, checked: n, brokenAt: null };
}

module.exports = { open, makeAudit, verifyAuditChain };
