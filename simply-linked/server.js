'use strict';
// Simply Linked: secure text messaging between clinics, pharmacies, day cares, visiting nurses, etc.
// Zero third-party dependencies: Node >= 22.5 (built-in http, crypto, sqlite).
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const sec = require('./lib/security');
const store = require('./lib/db');
const npi = require('./lib/npi');
const fax = require('./lib/fax');
const qr = require('./lib/qr');

// ---------------- Config ----------------
const PROD = process.env.NODE_ENV === 'production';
const CFG = {
  port: Number(process.env.PORT || 3000),
  host: process.env.HOST || (PROD ? '0.0.0.0' : '127.0.0.1'),
  dataDir: path.resolve(process.env.SL_DATA_DIR || path.join(__dirname, 'data')),
  idleMs: Number(process.env.SL_IDLE_MINUTES || 15) * 60_000,      // automatic logoff, 164.312(a)(2)(iii)
  absoluteMs: Number(process.env.SL_SESSION_HOURS || 12) * 3_600_000,
  requireMfa: process.env.SL_REQUIRE_MFA !== 'false',
  secureCookie: process.env.SL_SECURE_COOKIE ? process.env.SL_SECURE_COOKIE === 'true' : PROD,
  trustProxy: process.env.SL_TRUST_PROXY === 'true',
  baseUrl: process.env.SL_BASE_URL || '',
  inviteHours: 72,
  maxFailedLogins: 5,
  lockMs: 15 * 60_000,
  faxReminderHours: Number(process.env.SL_FAX_REMINDER_HOURS || 4),   // re-fax if not opened
  faxMax: Number(process.env.SL_FAX_MAX || 3),                         // total fax notices per org
  callAfterHours: Number(process.env.SL_CALL_AFTER_HOURS || 24),       // then a person calls them
  outreachDays: 30,
};

const ORG_TYPES = {
  clinic: 'Clinic / Physician office',
  hospital: 'Hospital',
  pharmacy: 'Pharmacy',
  dme: 'DME / Medical supply',
  home_health: 'Visiting nurse / Home health',
  day_care: 'Day care (adult or child)',
  snf: 'Nursing / Rehab facility',
  other: 'Other',
};
const KINDS = {
  general: 'Message',
  discharge: 'Discharge',
  med_change: 'Medication change',
  refill: 'Refill / Prescription',
  equipment: 'Equipment / Supplies (DME)',
  visit: 'Visit update',
  question: 'Question',
};

const keySource = sec.loadDataKey((fs.mkdirSync(CFG.dataDir, { recursive: true, mode: 0o700 }), CFG.dataDir));
const db = store.open(CFG.dataDir);
const audit = store.makeAudit(db);
const q = (sql) => db.prepare(sql);

// ---------------- HTTP helpers ----------------
class HttpError extends Error { constructor(status, message) { super(message); this.status = status; } }
const fail = (status, msg) => { throw new HttpError(status, msg); };

const SEC_HEADERS = {
  'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'; object-src 'none'",
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'no-referrer',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'same-origin',
};

function baseHeaders() {
  const h = { ...SEC_HEADERS };
  if (CFG.secureCookie) h['Strict-Transport-Security'] = 'max-age=63072000; includeSubDomains';
  return h;
}

function sendJson(res, status, obj, extra = {}) {
  const body = JSON.stringify(obj);
  res.writeHead(status, { ...baseHeaders(), 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', Pragma: 'no-cache', ...extra });
  res.end(body);
}

function clientIp(req) {
  if (CFG.trustProxy && req.headers['x-forwarded-for']) return String(req.headers['x-forwarded-for']).split(',')[0].trim();
  return req.socket.remoteAddress || '';
}

function readBody(req, limit = 64 * 1024) {
  return new Promise((resolve, reject) => {
    let size = 0; const chunks = [];
    req.on('data', (c) => { size += c.length; if (size > limit) { reject(new HttpError(413, 'Request too large')); req.destroy(); } else chunks.push(c); });
    req.on('end', () => {
      if (!chunks.length) return resolve({});
      try { resolve(JSON.parse(Buffer.concat(chunks).toString('utf8'))); } catch { reject(new HttpError(400, 'Invalid JSON')); }
    });
    req.on('error', reject);
  });
}

function parseCookies(req) {
  const out = {};
  for (const part of String(req.headers.cookie || '').split(';')) {
    const i = part.indexOf('='); if (i > 0) out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  }
  return out;
}

const COOKIE = CFG.secureCookie ? '__Host-sl_sid' : 'sl_sid';
const sessionCookie = (token) => `${COOKIE}=${token}; Path=/; HttpOnly; SameSite=Strict${CFG.secureCookie ? '; Secure' : ''}`;
const clearCookie = () => `${COOKIE}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${CFG.secureCookie ? '; Secure' : ''}`;

const str = (v, max, name, required = true) => {
  const s = typeof v === 'string' ? v.trim() : '';
  if (required && !s) fail(400, `${name} is required.`);
  if (s.length > max) fail(400, `${name} is too long (max ${max}).`);
  return s;
};
const validEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) && e.length <= 254;

// ---------------- Sessions ----------------
function loadSession(req) {
  const token = parseCookies(req)[COOKIE];
  if (!token) return null;
  const idHash = sec.sha256(token);
  const s = q('SELECT * FROM sessions WHERE id_hash = ?').get(idHash);
  if (!s) return null;
  const now = Date.now();
  const user = q('SELECT * FROM users WHERE id = ?').get(s.user_id);
  if (!user || !user.active || now - s.last_seen > CFG.idleMs || now - s.created_at > CFG.absoluteMs) {
    q('DELETE FROM sessions WHERE id_hash = ?').run(idHash);
    if (user) audit({ user, action: 'session.expired', ip: clientIp(req) });
    return null;
  }
  return { ...s, user };
}

function createSession(res, user, ip, mfaOk) {
  const token = sec.randomToken();
  const now = Date.now();
  q('INSERT INTO sessions (id_hash,user_id,mfa_ok,created_at,last_seen,ip) VALUES (?,?,?,?,?,?)').run(sec.sha256(token), user.id, mfaOk ? 1 : 0, now, now, ip);
  res.setHeader('Set-Cookie', sessionCookie(token));
}

function killUserSessions(userId) {
  q('DELETE FROM sessions WHERE user_id = ?').run(userId);
  for (const c of sse) if (c.userId === userId) c.res.end();
}

setInterval(() => {
  const now = Date.now();
  q('DELETE FROM sessions WHERE last_seen < ? OR created_at < ?').run(now - CFG.idleMs, now - CFG.absoluteMs);
}, 60_000).unref();

// Login throttling per IP (in addition to per-account lockout).
const ipAttempts = new Map();
function throttle(ip) {
  const now = Date.now();
  const rec = ipAttempts.get(ip) || { n: 0, since: now };
  if (now - rec.since > 15 * 60_000) { rec.n = 0; rec.since = now; }
  rec.n++; ipAttempts.set(ip, rec);
  if (rec.n > 30) fail(429, 'Too many attempts. Try again in 15 minutes.');
}

// ---------------- Real-time (Server-Sent Events, no PHI in events) ----------------
const sse = new Set();
function notifyOrgs(orgIds, payload) {
  const data = `data: ${JSON.stringify(payload)}\n\n`;
  for (const c of sse) if (orgIds.includes(c.orgId)) c.res.write(data);
}

// ---------------- Views ----------------
const publicUser = (u) => ({ id: u.id, name: u.name, email: u.email, title: u.title, role: u.role, isSuper: !!u.is_super, orgId: u.org_id, active: !!u.active, mfa: !!u.totp_enc });
const orgName = (id) => q('SELECT name FROM orgs WHERE id = ?').get(id)?.name || 'Unknown';
const orgBrief = (id) => { const o = q('SELECT id, name, type, verified, claimed FROM orgs WHERE id = ?').get(id); return o ? { name: o.name, typeLabel: ORG_TYPES[o.type], verified: !!o.verified, onNetwork: !!o.claimed } : { name: 'Unknown' }; };

// ---------------- Fax outreach (reach people who aren't on Simply Linked yet) ----------------
const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // no 0/O, 1/I/L
const newCode = () => Array.from({ length: 10 }, () => CODE_ALPHABET[require('node:crypto').randomInt(CODE_ALPHABET.length)]).join('');
const normCode = (c) => String(c || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
const publicBase = (req) => (CFG.baseUrl || `${CFG.secureCookie ? 'https' : 'http'}://${req.headers.host}`).replace(/\/$/, '');

function waitingFor(orgId) {
  return q(`SELECT COUNT(*) AS n FROM messages m JOIN thread_orgs o ON o.thread_id = m.thread_id
            WHERE o.org_id = ? AND m.sender_org_id != ?`).get(orgId, orgId).n;
}

async function faxOutreach(o, reminder) {
  const org = q('SELECT * FROM orgs WHERE id = ?').get(o.org_id);
  if (!org || org.claimed || org.no_fax) return;
  if (!org.fax) { q('UPDATE outreach SET needs_call = 1 WHERE id = ?').run(o.id); return; }
  const sender = q('SELECT u.name, u.title, g.name AS org_name, g.phone FROM users u JOIN orgs g ON g.id = u.org_id WHERE u.id = ?').get(o.created_by);
  const code = sec.decrypt(o.code_enc);
  const info = {
    toName: org.name, fromPerson: sender.title ? `${sender.name} (${sender.title})` : sender.name, fromOrg: sender.org_name, fromPhone: sender.phone,
    count: waitingFor(org.id), code, link: `${o.site_url}/#/c/${code}`, siteUrl: o.site_url.replace(/^https?:\/\//, ''), reminder,
  };
  info.qr = qr.encode(info.link, 'M');
  const r = await fax.send({ to: org.fax, info, dataDir: CFG.dataDir });
  const now = Date.now();
  q('INSERT INTO fax_log (outreach_id,to_fax,at,kind,provider,ok,detail) VALUES (?,?,?,?,?,?,?)').run(o.id, org.fax, now, reminder ? 'reminder' : 'first', r.provider, r.ok ? 1 : 0, String(r.detail || '').slice(0, 300));
  if (r.ok) q('UPDATE outreach SET last_fax_at = ?, fax_count = fax_count + 1 WHERE id = ?').run(now, o.id);
  else q('UPDATE outreach SET needs_call = 1 WHERE id = ?').run(o.id);
  audit({ user: null, action: r.ok ? 'fax.sent' : 'fax.failed', target: `org:${org.id}`, ok: r.ok });
  notifyOrgs(q('SELECT DISTINCT t2.org_id FROM thread_orgs t1 JOIN thread_orgs t2 ON t2.thread_id = t1.thread_id WHERE t1.org_id = ?').all(org.id).map((x) => x.org_id), { type: 'outreach' });
}

/** Called after a message goes to one or more orgs. Faxes any recipient that isn't signed up yet. */
function reachOut(orgIds, user, req) {
  for (const id of orgIds) {
    const org = q('SELECT * FROM orgs WHERE id = ?').get(id);
    if (!org || org.claimed) continue;
    let o = q('SELECT * FROM outreach WHERE org_id = ?').get(id);
    if (!o) {
      const code = newCode(); const now = Date.now();
      q('INSERT INTO outreach (org_id,code_hash,code_enc,site_url,created_by,created_at,expires_at) VALUES (?,?,?,?,?,?,?)')
        .run(id, sec.sha256(code), sec.encrypt(code), publicBase(req), user.id, now, now + CFG.outreachDays * 86_400_000);
      o = q('SELECT * FROM outreach WHERE org_id = ?').get(id);
      faxOutreach(o, false).catch((e) => console.error('fax error', e.message));
    } else if (!o.last_fax_at || Date.now() - o.last_fax_at > 60 * 60_000) {
      // New message for someone who still hasn't opened: send an updated notice (at most hourly).
      if (o.fax_count < CFG.faxMax) faxOutreach(o, true).catch((e) => console.error('fax error', e.message));
    }
  }
}

// Follow-up: re-fax unopened notices, then hand to a person to call.
async function followUpSweep() {
  const now = Date.now();
  for (const o of q(`SELECT o.* FROM outreach o JOIN orgs g ON g.id = o.org_id WHERE o.claimed_at IS NULL AND g.claimed = 0 AND o.expires_at > ?`).all(now)) {
    const org = q('SELECT no_fax FROM orgs WHERE id = ?').get(o.org_id);
    if (!org.no_fax && o.fax_count > 0 && o.fax_count < CFG.faxMax && !o.opened_at && now - o.last_fax_at > CFG.faxReminderHours * 3_600_000) await faxOutreach(o, true);
    if (!o.needs_call && (now - o.created_at > CFG.callAfterHours * 3_600_000 || org.no_fax)) {
      q('UPDATE outreach SET needs_call = 1 WHERE id = ?').run(o.id);
      audit({ user: null, action: 'outreach.needs_call', target: `org:${o.org_id}` });
    }
  }
}
setInterval(() => followUpSweep().catch((e) => console.error('follow-up error', e.message)), 5 * 60_000).unref();

/** Delivery status of an org that isn't signed up yet (shown to senders). */
function pendingStatus(orgId) {
  const org = q('SELECT claimed, no_fax, fax, phone FROM orgs WHERE id = ?').get(orgId);
  if (!org || org.claimed) return null;
  const o = q('SELECT * FROM outreach WHERE org_id = ?').get(orgId);
  const lastFax = o ? q('SELECT ok, at FROM fax_log WHERE outreach_id = ? ORDER BY id DESC LIMIT 1').get(o.id) : null;
  let text;
  if (org.no_fax) text = 'Asked not to get fax notices. Please call them.';
  else if (!o || !o.fax_count) text = lastFax && !lastFax.ok ? 'Fax did not go through. We will call them.' : (org.fax ? 'Sending fax notice...' : 'No fax number. We will call them.');
  else if (o.opened_at) text = 'Opened the fax link, signing up now.';
  else if (o.needs_call) text = `Faxed ${o.fax_count}x, not opened yet. We are calling them.`;
  else text = `Fax notice sent${o.fax_count > 1 ? ` (${o.fax_count}x)` : ''}. Not opened yet. We'll re-fax and then call.`;
  return { text, faxedAt: o?.last_fax_at || null, faxCount: o?.fax_count || 0, opened: !!o?.opened_at, phone: org.phone };
}

function threadOrgIds(threadId) { return q('SELECT org_id FROM thread_orgs WHERE thread_id = ?').all(threadId).map((r) => r.org_id); }

function requireThreadAccess(ctx, threadId) {
  const t = q('SELECT * FROM threads WHERE id = ?').get(threadId);
  if (!t || !q('SELECT 1 FROM thread_orgs WHERE thread_id = ? AND org_id = ?').get(threadId, ctx.user.org_id)) {
    audit({ user: ctx.user, action: 'thread.access_denied', target: threadId, ip: ctx.ip, ok: false });
    fail(404, 'Conversation not found.');
  }
  return t;
}

function lastAckUpto(threadId, orgId) {
  return q('SELECT MAX(upto_msg_id) AS m FROM acks WHERE thread_id = ? AND org_id = ?').get(threadId, orgId)?.m || 0;
}

function threadSummary(t, user) {
  const orgIds = threadOrgIds(t.id);
  const last = q('SELECT id, sender_org_id, created_at FROM messages WHERE thread_id = ? ORDER BY id DESC LIMIT 1').get(t.id);
  const lastRead = q('SELECT last_msg_id FROM reads WHERE thread_id = ? AND user_id = ?').get(t.id, user.id)?.last_msg_id || 0;
  const lastFromOthers = q('SELECT MAX(id) AS m FROM messages WHERE thread_id = ? AND sender_org_id != ?').get(t.id, user.org_id)?.m || 0;
  const myAck = lastAckUpto(t.id, user.org_id);
  // Messages my org sent that someone hasn't confirmed yet.
  const lastMine = q('SELECT MAX(id) AS m FROM messages WHERE thread_id = ? AND sender_org_id = ?').get(t.id, user.org_id)?.m || 0;
  const waitingOn = lastMine ? orgIds.filter((o) => o !== user.org_id && lastAckUpto(t.id, o) < lastMine).map(orgName) : [];
  return {
    id: t.id, kind: t.kind, kindLabel: KINDS[t.kind] || 'Message', urgent: !!t.urgent,
    subject: sec.decrypt(t.subject_enc), patient: sec.decrypt(t.patient_enc),
    orgs: orgIds.filter((o) => o !== user.org_id).map(orgBrief),
    updatedAt: t.updated_at, closed: !!t.closed_at,
    unread: !!last && last.id > lastRead && last.sender_org_id !== user.org_id,
    needsAck: !t.closed_at && lastFromOthers > myAck,
    waitingOn: t.closed_at ? [] : waitingOn,
  };
}

// ---------------- Routes ----------------
const routes = [];
const route = (method, pattern, opts, handler) => routes.push({ method, re: new RegExp(`^${pattern}$`), opts, handler });

// --- Sign up: one screen, then straight into the inbox ---
route('GET', '/api/signup', { auth: 'none' }, () => ({ orgTypes: ORG_TYPES, firstUser: !q('SELECT 1 FROM users LIMIT 1').get() }));

route('POST', '/api/signup', { auth: 'none' }, async (ctx) => {
  throttle(ctx.ip);
  const b = ctx.body;
  const name = str(b.name, 100, 'Your name');
  const email = str(b.email, 254, 'Email').toLowerCase();
  if (!validEmail(email)) fail(400, 'Enter a valid email.');
  const p = sec.passwordProblem(b.password); if (p) fail(400, p);
  const orgNameV = str(b.orgName, 120, 'Organization name');
  const type = ORG_TYPES[b.orgType] ? b.orgType : fail(400, 'Choose what kind of place you work at.');
  if (q('SELECT 1 FROM users WHERE email = ?').get(email)) fail(409, 'This email already has an account. Sign in instead.');
  const first = !q('SELECT 1 FROM users LIMIT 1').get(); // the very first account runs the network
  // Optional NPI: auto-verifies the organization against the national registry.
  const npiNum = /^\d{10}$/.test(String(b.npi || '').replace(/\D/g, '')) ? String(b.npi).replace(/\D/g, '') : null;
  let reg = null;
  if (npiNum) {
    const existing = q('SELECT claimed FROM orgs WHERE npi = ?').get(npiNum);
    if (existing && !existing.claimed) fail(409, 'WAITING: Messages are already waiting for this organization. Use the code from the fax we sent, or tap "Fax me the code".');
    if (existing) fail(409, 'Your organization is already on Simply Linked. Ask a coworker (your admin) to invite you.');
    reg = await npi.lookup(npiNum);
  }
  const verified = first || (reg && !reg.isPerson && npi.namesMatch(orgNameV, reg.name)) || (reg && reg.isPerson && npi.namesMatch(name, reg.name));
  const now = Date.now();
  db.exec('BEGIN');
  let user;
  try {
    const orgId = q('INSERT INTO orgs (name,type,phone,fax,npi,address,verified,created_at) VALUES (?,?,?,?,?,?,?,?)')
      .run(orgNameV, type, fax.normalizeUs(b.phone) || fax.normalizeUs(reg?.phone) || null, fax.normalizeUs(reg?.fax) || null, npiNum, reg?.address || null, verified ? 1 : 0, now).lastInsertRowid;
    const uid = q("INSERT INTO users (org_id,email,name,title,role,is_super,pw_hash,created_at) VALUES (?,?,?,?, 'admin', ?, ?, ?)")
      .run(orgId, email, name, str(b.title, 80, 'Title', false), first ? 1 : 0, sec.hashPassword(b.password), now).lastInsertRowid;
    db.exec('COMMIT');
    user = q('SELECT * FROM users WHERE id = ?').get(uid);
  } catch (e) { db.exec('ROLLBACK'); throw e; }
  audit({ user, action: 'signup', target: `org:${user.org_id}`, ip: ctx.ip });
  // Use it right away. Two-step sign-in is offered now and required from the next sign-in on.
  createSession(ctx.res, user, ctx.ip, true);
  return { next: 'app' };
});

// --- Login / MFA / logout ---
route('POST', '/api/login', { auth: 'none' }, (ctx) => {
  throttle(ctx.ip);
  const email = String(ctx.body.email || '').trim().toLowerCase();
  const pw = String(ctx.body.password || '');
  const user = q('SELECT * FROM users WHERE email = ?').get(email);
  const now = Date.now();
  if (user && user.locked_until > now) {
    audit({ user, action: 'login.locked', ip: ctx.ip, ok: false });
    fail(423, 'Account temporarily locked after too many failed attempts. Try again later or ask your admin.');
  }
  const good = sec.verifyPassword(pw, user ? user.pw_hash : sec.DUMMY_HASH);
  if (!user || !good || !user.active) {
    if (user) {
      const n = user.failed_logins + 1;
      q('UPDATE users SET failed_logins = ?, locked_until = ? WHERE id = ?').run(n >= CFG.maxFailedLogins ? 0 : n, n >= CFG.maxFailedLogins ? now + CFG.lockMs : 0, user.id);
      audit({ user, action: user.active ? 'login.failed' : 'login.inactive', ip: ctx.ip, ok: false });
    } else {
      audit({ user: null, action: 'login.failed_unknown', target: sec.sha256(email).slice(0, 12), ip: ctx.ip, ok: false });
    }
    fail(401, 'Email or password is incorrect.');
  }
  q('UPDATE users SET failed_logins = 0, locked_until = 0 WHERE id = ?').run(user.id);
  const needMfa = CFG.requireMfa || !!user.totp_enc;
  createSession(ctx.res, user, ctx.ip, !needMfa);
  audit({ user, action: 'login.password_ok', ip: ctx.ip });
  return { next: !needMfa ? 'app' : user.totp_enc ? 'mfa' : 'mfa-setup' };
});

route('POST', '/api/mfa/setup', { auth: 'any' }, (ctx) => {
  if (ctx.user.totp_enc) fail(400, 'Two-step sign-in is already set up.');
  const secret = sec.newTotpSecret();
  q('UPDATE users SET totp_pending_enc = ? WHERE id = ?').run(sec.encrypt(secret), ctx.user.id);
  const label = encodeURIComponent(`Simply Linked:${ctx.user.email}`);
  const uri = `otpauth://totp/${label}?secret=${secret}&issuer=Simply%20Linked&digits=6&period=30`;
  return { secret: secret.replace(/(.{4})/g, '$1 ').trim(), uri, qr: 'data:image/svg+xml;base64,' + Buffer.from(qr.toSvg(uri, { px: 5 })).toString('base64') };
});

route('POST', '/api/mfa/verify', { auth: 'any' }, (ctx) => {
  if (!ctx.session) fail(401, 'Please sign in.');
  throttle(ctx.ip);
  const u = ctx.user;
  const enrolling = !u.totp_enc;
  const encSecret = enrolling ? u.totp_pending_enc : u.totp_enc;
  if (!encSecret) fail(400, 'Start setup first.');
  const step = sec.verifyTotp(sec.decrypt(encSecret), String(ctx.body.code || '').replace(/\s/g, ''), u.totp_last_step);
  if (!step) {
    const n = u.failed_logins + 1;
    q('UPDATE users SET failed_logins = ?, locked_until = ? WHERE id = ?').run(n >= CFG.maxFailedLogins ? 0 : n, n >= CFG.maxFailedLogins ? Date.now() + CFG.lockMs : 0, u.id);
    if (n >= CFG.maxFailedLogins) killUserSessions(u.id);
    audit({ user: u, action: 'mfa.failed', ip: ctx.ip, ok: false });
    fail(401, 'That code did not work. Check the time on your phone and try the newest code.');
  }
  if (enrolling) q('UPDATE users SET totp_enc = totp_pending_enc, totp_pending_enc = NULL WHERE id = ?').run(u.id);
  q('UPDATE users SET totp_last_step = ?, failed_logins = 0 WHERE id = ?').run(step, u.id);
  // Rotate the session id on privilege change.
  q('DELETE FROM sessions WHERE id_hash = ?').run(ctx.session.id_hash);
  createSession(ctx.res, u, ctx.ip, true);
  audit({ user: u, action: enrolling ? 'mfa.enrolled' : 'login.success', ip: ctx.ip });
  return { next: 'app' };
});

route('POST', '/api/logout', { auth: 'any' }, (ctx) => {
  if (ctx.session) {
    q('DELETE FROM sessions WHERE id_hash = ?').run(ctx.session.id_hash);
    audit({ user: ctx.user, action: ctx.body.reason === 'idle' ? 'logout.idle' : 'logout', ip: ctx.ip });
  }
  ctx.res.setHeader('Set-Cookie', clearCookie());
  return { ok: true };
});

route('POST', '/api/ping', { auth: 'full' }, () => ({ ok: true })); // keeps an active (not idle) user signed in

route('GET', '/api/me', { auth: 'any' }, (ctx) => {
  if (!ctx.session) return { signedIn: false };
  const org = q('SELECT * FROM orgs WHERE id = ?').get(ctx.user.org_id);
  return {
    signedIn: true, mfaOk: !!ctx.session.mfa_ok, mfaSetUp: !!ctx.user.totp_enc,
    user: publicUser(ctx.user), org: { id: org.id, name: org.name, type: org.type, typeLabel: ORG_TYPES[org.type], verified: !!org.verified },
    idleMinutes: CFG.idleMs / 60_000, kinds: KINDS, orgTypes: ORG_TYPES,
  };
});

route('POST', '/api/me/password', { auth: 'full' }, (ctx) => {
  if (!sec.verifyPassword(String(ctx.body.current || ''), ctx.user.pw_hash)) fail(400, 'Current password is incorrect.');
  const p = sec.passwordProblem(ctx.body.next); if (p) fail(400, p);
  q('UPDATE users SET pw_hash = ? WHERE id = ?').run(sec.hashPassword(ctx.body.next), ctx.user.id);
  q('DELETE FROM sessions WHERE user_id = ? AND id_hash != ?').run(ctx.user.id, ctx.session.id_hash);
  audit({ user: ctx.user, action: 'password.changed', ip: ctx.ip });
  return { ok: true };
});

// --- Invites ---
route('GET', '/api/invite/([A-Za-z0-9_-]{20,})', { auth: 'none' }, (ctx) => {
  const inv = q('SELECT * FROM invites WHERE token_hash = ?').get(sec.sha256(ctx.params[0]));
  if (!inv || inv.used_at || inv.expires_at < Date.now()) fail(404, 'This invite link is invalid or has expired. Ask your admin for a new one.');
  return { email: inv.email, orgName: orgName(inv.org_id), role: inv.role };
});

route('POST', '/api/invite/accept', { auth: 'none' }, (ctx) => {
  throttle(ctx.ip);
  const inv = q('SELECT * FROM invites WHERE token_hash = ?').get(sec.sha256(String(ctx.body.token || '')));
  if (!inv || inv.used_at || inv.expires_at < Date.now()) fail(404, 'This invite link is invalid or has expired.');
  if (q('SELECT 1 FROM users WHERE email = ?').get(inv.email)) fail(409, 'An account with this email already exists.');
  const name = str(ctx.body.name, 100, 'Name');
  const p = sec.passwordProblem(ctx.body.password); if (p) fail(400, p);
  const now = Date.now();
  const uid = q('INSERT INTO users (org_id,email,name,title,role,pw_hash,created_at) VALUES (?,?,?,?,?,?,?)')
    .run(inv.org_id, inv.email, name, str(ctx.body.title, 80, 'Title', false), inv.role, sec.hashPassword(ctx.body.password), now).lastInsertRowid;
  q('UPDATE invites SET used_at = ? WHERE token_hash = ?').run(now, inv.token_hash);
  const user = q('SELECT * FROM users WHERE id = ?').get(uid);
  audit({ user, action: 'invite.accepted', ip: ctx.ip });
  createSession(ctx.res, user, ctx.ip, true);
  return { next: 'app' };
});

// --- Directory ---
route('GET', '/api/orgs', { auth: 'full' }, (ctx) =>
  q('SELECT id, name, type, phone, fax, address, verified, claimed FROM orgs WHERE active = 1 AND id != ? ORDER BY claimed DESC, name').all(ctx.user.org_id)
    .map((o) => ({ id: o.id, name: o.name, type: o.type, typeLabel: ORG_TYPES[o.type], address: o.address, verified: !!o.verified, onNetwork: !!o.claimed,
      fax: o.claimed ? null : fax.pretty(o.fax) })));

// Look up a pharmacy / DME / agency in the national NPI registry (name, city, state, or NPI number).
route('GET', '/api/npi/search', { auth: 'full' }, async (ctx) => {
  const results = await npi.search({ name: ctx.query.get('name'), city: ctx.query.get('city'), state: ctx.query.get('state') });
  return { available: npi.ENABLED, results: results.map((r) => {
    const existing = q('SELECT id, claimed FROM orgs WHERE npi = ?').get(r.npi);
    return { ...r, faxPretty: fax.pretty(r.fax), existingId: existing?.id || null, onNetwork: !!existing?.claimed };
  }) };
});

route('GET', '/api/npi/lookup/(\\d{10})', { auth: 'none' }, async (ctx) => {
  throttle(ctx.ip);
  const r = await npi.lookup(ctx.params[0]);
  return r ? { found: true, name: r.name, address: r.address, phone: r.phone, fax: r.fax, isPerson: r.isPerson } : { found: false };
});

// Add an organization that isn't on Simply Linked yet, so you can message it (they'll get a fax notice).
route('POST', '/api/orgs/add', { auth: 'full' }, (ctx) => {
  const b = ctx.body;
  const name = str(b.name, 120, 'Name');
  const type = ORG_TYPES[b.type] ? b.type : 'other';
  const faxNum = b.fax ? (fax.normalizeUs(b.fax) || fail(400, 'Enter a 10-digit US fax number.')) : null;
  const phone = b.phone ? (fax.normalizeUs(b.phone) || fail(400, 'Enter a 10-digit US phone number.')) : null;
  if (!faxNum && !phone) fail(400, 'Enter a fax number (or at least a phone number) so we can reach them.');
  const npiNum = /^\d{10}$/.test(String(b.npi || '')) ? String(b.npi) : null;
  const same = (npiNum && q('SELECT id FROM orgs WHERE npi = ?').get(npiNum)) || (faxNum && q('SELECT id FROM orgs WHERE fax = ?').get(faxNum));
  if (same) return { id: same.id, existing: true };
  const id = q('INSERT INTO orgs (name,type,phone,fax,npi,address,verified,claimed,created_at) VALUES (?,?,?,?,?,?,0,0,?)')
    .run(name, type, phone, faxNum, npiNum, str(b.address, 200, 'Address', false) || null, Date.now()).lastInsertRowid;
  audit({ user: ctx.user, action: 'org.added_by_sender', target: `org:${id}`, ip: ctx.ip });
  return { id: Number(id) };
});

// --- "I got a fax": open the code, sign up, read the message ---
function outreachByCode(code) {
  const c = normCode(code);
  if (c.length !== 10) return null;
  const o = q('SELECT * FROM outreach WHERE code_hash = ?').get(sec.sha256(c));
  return o && o.expires_at > Date.now() ? o : null;
}

route('GET', '/api/claim/([A-Za-z0-9-]{10,11})', { auth: 'none' }, (ctx) => {
  throttle(ctx.ip);
  const o = outreachByCode(ctx.params[0]);
  if (!o) fail(404, 'That code did not work. Check it against the fax (letters and numbers, no 0/O or 1/I).');
  const org = q('SELECT * FROM orgs WHERE id = ?').get(o.org_id);
  if (org.claimed) return { claimed: true, orgName: org.name };
  if (!o.opened_at) {
    q('UPDATE outreach SET opened_at = ? WHERE id = ?').run(Date.now(), o.id);
    audit({ user: null, action: 'outreach.opened', target: `org:${org.id}`, ip: ctx.ip });
  }
  const from = q(`SELECT DISTINCT g.name FROM messages m JOIN thread_orgs t ON t.thread_id = m.thread_id JOIN orgs g ON g.id = m.sender_org_id
                  WHERE t.org_id = ? AND m.sender_org_id != ?`).all(org.id, org.id).map((r) => r.name);
  return { claimed: false, orgName: org.name, orgType: org.type, waiting: waitingFor(org.id), from, orgTypes: ORG_TYPES };
});

route('POST', '/api/claim', { auth: 'none' }, (ctx) => {
  throttle(ctx.ip);
  const b = ctx.body;
  const o = outreachByCode(b.code);
  if (!o) fail(404, 'That code did not work.');
  const org = q('SELECT * FROM orgs WHERE id = ?').get(o.org_id);
  if (org.claimed) fail(409, `${org.name} is already set up. Ask a coworker to invite you, or sign in.`);
  const name = str(b.name, 100, 'Your name');
  const email = str(b.email, 254, 'Email').toLowerCase();
  if (!validEmail(email)) fail(400, 'Enter a valid email.');
  if (q('SELECT 1 FROM users WHERE email = ?').get(email)) fail(409, 'This email already has an account. Sign in instead.');
  const p = sec.passwordProblem(b.password); if (p) fail(400, p);
  const now = Date.now();
  db.exec('BEGIN');
  let user;
  try {
    const orgNameV = str(b.orgName, 120, 'Organization name', false) || org.name;
    q('UPDATE orgs SET claimed = 1, name = ?, type = ? WHERE id = ?').run(orgNameV, ORG_TYPES[b.orgType] ? b.orgType : org.type, org.id);
    const uid = q("INSERT INTO users (org_id,email,name,title,role,pw_hash,created_at) VALUES (?,?,?,?, 'admin', ?, ?)")
      .run(org.id, email, name, str(b.title, 80, 'Title', false), sec.hashPassword(b.password), now).lastInsertRowid;
    q('UPDATE outreach SET claimed_at = ?, needs_call = 0 WHERE id = ?').run(now, o.id);
    db.exec('COMMIT');
    user = q('SELECT * FROM users WHERE id = ?').get(uid);
  } catch (e) { db.exec('ROLLBACK'); throw e; }
  audit({ user, action: 'outreach.claimed', target: `org:${org.id}`, ip: ctx.ip });
  createSession(ctx.res, user, ctx.ip, true);
  notifyOrgs(q('SELECT DISTINCT t2.org_id FROM thread_orgs t1 JOIN thread_orgs t2 ON t2.thread_id = t1.thread_id WHERE t1.org_id = ?').all(org.id).map((x) => x.org_id), { type: 'outreach' });
  return { next: 'app' };
});

route('POST', '/api/claim/stop', { auth: 'none' }, (ctx) => {
  throttle(ctx.ip);
  const o = outreachByCode(ctx.body.code);
  if (!o) fail(404, 'That code did not work.');
  q('UPDATE orgs SET no_fax = 1 WHERE id = ?').run(o.org_id);
  q('UPDATE outreach SET needs_call = 1 WHERE id = ?').run(o.id);
  audit({ user: null, action: 'outreach.fax_opt_out', target: `org:${o.org_id}`, ip: ctx.ip });
  return { ok: true };
});

// Someone signing up whose organization already has messages waiting can have the code re-faxed
// to the fax number on file (never shown on screen, so only the real org can get in).
route('POST', '/api/claim/refax', { auth: 'none' }, async (ctx) => {
  throttle(ctx.ip);
  const org = q('SELECT * FROM orgs WHERE npi = ? AND claimed = 0').get(String(ctx.body.npi || ''));
  const o = org && q('SELECT * FROM outreach WHERE org_id = ?').get(org.id);
  if (o && org.fax && (!o.last_fax_at || Date.now() - o.last_fax_at > 10 * 60_000)) await faxOutreach(o, true);
  return { ok: true, message: 'If messages are waiting for that NPI, we just faxed the code to the fax number on file.' };
});

// --- Conversations ---
route('GET', '/api/threads', { auth: 'full' }, (ctx) => {
  const closed = ctx.query.get('closed') === '1';
  const rows = q(`SELECT t.* FROM threads t JOIN thread_orgs o ON o.thread_id = t.id
                  WHERE o.org_id = ? AND (t.closed_at IS ${closed ? 'NOT ' : ''}NULL)
                  ORDER BY t.updated_at DESC LIMIT 300`).all(ctx.user.org_id);
  const list = rows.map((t) => threadSummary(t, ctx.user));
  audit({ user: ctx.user, action: 'inbox.viewed', target: closed ? 'closed' : 'open', ip: ctx.ip });
  return { threads: list };
});

route('POST', '/api/threads', { auth: 'full' }, (ctx) => {
  const b = ctx.body;
  const kind = KINDS[b.kind] ? b.kind : 'general';
  const toIds = [...new Set((Array.isArray(b.orgIds) ? b.orgIds : []).map(Number))].filter((id) => id !== ctx.user.org_id);
  if (!toIds.length) fail(400, 'Choose who to send to.');
  if (toIds.length > 20) fail(400, 'Too many recipients.');
  for (const id of toIds) if (!q('SELECT 1 FROM orgs WHERE id = ? AND active = 1').get(id)) fail(400, 'One of the recipients is not available.');
  const patient = str(b.patient, 120, 'Patient', false);
  const subject = str(b.subject, 150, 'Subject', false) || KINDS[kind];
  const body = str(b.body, 5000, 'Message');
  const now = Date.now();
  db.exec('BEGIN');
  try {
    const tid = q('INSERT INTO threads (kind,urgent,subject_enc,patient_enc,created_by,created_at,updated_at) VALUES (?,?,?,?,?,?,?)')
      .run(kind, b.urgent ? 1 : 0, sec.encrypt(subject), patient ? sec.encrypt(patient) : null, ctx.user.id, now, now).lastInsertRowid;
    for (const o of [ctx.user.org_id, ...toIds]) q('INSERT INTO thread_orgs (thread_id, org_id) VALUES (?,?)').run(tid, o);
    const mid = q('INSERT INTO messages (thread_id,sender_id,sender_org_id,body_enc,created_at) VALUES (?,?,?,?,?)')
      .run(tid, ctx.user.id, ctx.user.org_id, sec.encrypt(body), now).lastInsertRowid;
    q('INSERT INTO reads (thread_id,user_id,last_msg_id) VALUES (?,?,?)').run(tid, ctx.user.id, mid);
    db.exec('COMMIT');
    audit({ user: ctx.user, action: 'thread.created', target: tid, ip: ctx.ip });
    notifyOrgs([ctx.user.org_id, ...toIds], { type: 'thread', id: Number(tid) });
    reachOut(toIds, ctx.user, ctx.req);
    return { id: Number(tid) };
  } catch (e) { db.exec('ROLLBACK'); throw e; }
});

route('GET', '/api/threads/(\\d+)', { auth: 'full' }, (ctx) => {
  const tid = Number(ctx.params[0]);
  const t = requireThreadAccess(ctx, tid);
  const orgIds = threadOrgIds(tid);
  const acks = q(`SELECT a.*, u.name AS user_name FROM acks a JOIN users u ON u.id = a.user_id WHERE a.thread_id = ? ORDER BY a.id`).all(tid);
  const msgs = q(`SELECT m.*, u.name AS sender_name, u.title AS sender_title FROM messages m JOIN users u ON u.id = m.sender_id
                  WHERE m.thread_id = ? ORDER BY m.id`).all(tid).map((m) => ({
    id: m.id, body: sec.decrypt(m.body_enc), at: m.created_at,
    sender: m.sender_name, senderTitle: m.sender_title, senderOrg: orgName(m.sender_org_id), mine: m.sender_org_id === ctx.user.org_id,
    receipts: orgIds.filter((o) => o !== m.sender_org_id).map((o) => {
      const a = acks.find((x) => x.org_id === o && x.upto_msg_id >= m.id);
      return { org: orgName(o), by: a ? a.user_name : null, at: a ? a.created_at : null, pending: a ? null : pendingStatus(o) };
    }),
  }));
  const lastId = msgs.length ? msgs[msgs.length - 1].id : 0;
  q('INSERT INTO reads (thread_id,user_id,last_msg_id) VALUES (?,?,?) ON CONFLICT(thread_id,user_id) DO UPDATE SET last_msg_id = excluded.last_msg_id').run(tid, ctx.user.id, lastId);
  audit({ user: ctx.user, action: 'thread.viewed', target: tid, ip: ctx.ip });
  const creator = q('SELECT name FROM users WHERE id = ?').get(t.created_by);
  return { thread: { ...threadSummary(t, ctx.user), startedBy: creator?.name, startedAt: t.created_at, allOrgs: orgIds.map(orgBrief) }, messages: msgs };
});

route('POST', '/api/threads/(\\d+)/messages', { auth: 'full' }, (ctx) => {
  const tid = Number(ctx.params[0]);
  const t = requireThreadAccess(ctx, tid);
  if (t.closed_at) fail(400, 'This conversation is closed. Reopen it to reply.');
  const body = str(ctx.body.body, 5000, 'Message');
  const now = Date.now();
  const mid = q('INSERT INTO messages (thread_id,sender_id,sender_org_id,body_enc,created_at) VALUES (?,?,?,?,?)')
    .run(tid, ctx.user.id, ctx.user.org_id, sec.encrypt(body), now).lastInsertRowid;
  // Replying means you've seen everything above it.
  q('INSERT INTO acks (thread_id,org_id,user_id,upto_msg_id,created_at) VALUES (?,?,?,?,?)').run(tid, ctx.user.org_id, ctx.user.id, mid, now);
  q('UPDATE threads SET updated_at = ? WHERE id = ?').run(now, tid);
  audit({ user: ctx.user, action: 'message.sent', target: tid, ip: ctx.ip });
  notifyOrgs(threadOrgIds(tid), { type: 'thread', id: tid });
  reachOut(threadOrgIds(tid).filter((o) => o !== ctx.user.org_id), ctx.user, ctx.req);
  return { id: Number(mid) };
});

route('POST', '/api/threads/(\\d+)/ack', { auth: 'full' }, (ctx) => {
  const tid = Number(ctx.params[0]);
  requireThreadAccess(ctx, tid);
  const lastId = q('SELECT MAX(id) AS m FROM messages WHERE thread_id = ?').get(tid)?.m || 0;
  q('INSERT INTO acks (thread_id,org_id,user_id,upto_msg_id,created_at) VALUES (?,?,?,?,?)').run(tid, ctx.user.org_id, ctx.user.id, lastId, Date.now());
  audit({ user: ctx.user, action: 'thread.acknowledged', target: tid, ip: ctx.ip });
  notifyOrgs(threadOrgIds(tid), { type: 'thread', id: tid });
  return { ok: true };
});

route('POST', '/api/threads/(\\d+)/(close|reopen)', { auth: 'full' }, (ctx) => {
  const tid = Number(ctx.params[0]);
  requireThreadAccess(ctx, tid);
  const close = ctx.params[1] === 'close';
  q('UPDATE threads SET closed_at = ?, closed_by = ?, updated_at = ? WHERE id = ?').run(close ? Date.now() : null, close ? ctx.user.id : null, Date.now(), tid);
  audit({ user: ctx.user, action: close ? 'thread.closed' : 'thread.reopened', target: tid, ip: ctx.ip });
  notifyOrgs(threadOrgIds(tid), { type: 'thread', id: tid });
  return { ok: true };
});

route('GET', '/api/events', { auth: 'full', stream: true }, (ctx) => {
  const { res } = ctx;
  res.writeHead(200, { ...baseHeaders(), 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-store', Connection: 'keep-alive' });
  res.write('retry: 5000\n\n');
  const client = { res, orgId: ctx.user.org_id, userId: ctx.user.id, sid: ctx.session.id_hash };
  sse.add(client);
  const beat = setInterval(() => {
    // Close the stream once the session is gone (logout / idle timeout).
    if (!q('SELECT 1 FROM sessions WHERE id_hash = ?').get(client.sid)) return res.end();
    res.write(': ping\n\n');
  }, 25_000);
  const done = () => { clearInterval(beat); sse.delete(client); };
  res.on('close', done); res.on('finish', done);
});

// --- Admin: people, invites, organizations, audit log ---
function adminOrgScope(ctx, orgId) {
  const id = Number(orgId || ctx.user.org_id);
  if (id !== ctx.user.org_id && !ctx.user.is_super) fail(403, 'Not allowed.');
  if (!q('SELECT 1 FROM orgs WHERE id = ?').get(id)) fail(404, 'Organization not found.');
  return id;
}

route('GET', '/api/admin/people', { auth: 'full', admin: true }, (ctx) => {
  const orgId = adminOrgScope(ctx, ctx.query.get('orgId'));
  const users = q('SELECT * FROM users WHERE org_id = ? ORDER BY active DESC, name').all(orgId).map(publicUser);
  const invites = q('SELECT email, role, created_at, expires_at FROM invites WHERE org_id = ? AND used_at IS NULL AND expires_at > ? ORDER BY created_at DESC').all(orgId, Date.now());
  return { orgName: orgName(orgId), users, invites };
});

route('POST', '/api/admin/invites', { auth: 'full', admin: true }, (ctx) => {
  const orgId = adminOrgScope(ctx, ctx.body.orgId);
  const email = str(ctx.body.email, 254, 'Email').toLowerCase();
  if (!validEmail(email)) fail(400, 'Enter a valid email.');
  if (q('SELECT 1 FROM users WHERE email = ?').get(email)) fail(409, 'Someone already uses this email.');
  const role = ctx.body.role === 'admin' ? 'admin' : 'member';
  const token = sec.randomToken();
  const now = Date.now();
  q('DELETE FROM invites WHERE email = ? AND used_at IS NULL').run(email);
  q('INSERT INTO invites (token_hash,org_id,email,role,created_by,created_at,expires_at) VALUES (?,?,?,?,?,?,?)')
    .run(sec.sha256(token), orgId, email, role, ctx.user.id, now, now + CFG.inviteHours * 3_600_000);
  audit({ user: ctx.user, action: 'invite.created', target: `org:${orgId}`, ip: ctx.ip });
  const base = publicBase(ctx.req);
  const link = `${base}/#/invite/${token}`;
  return { link, expiresHours: CFG.inviteHours, qr: 'data:image/svg+xml;base64,' + Buffer.from(qr.toSvg(link, { px: 5 })).toString('base64') };
});

route('POST', '/api/admin/users/(\\d+)/(deactivate|activate|reset-mfa|make-admin|make-member)', { auth: 'full', admin: true }, (ctx) => {
  const target = q('SELECT * FROM users WHERE id = ?').get(Number(ctx.params[0]));
  if (!target) fail(404, 'User not found.');
  adminOrgScope(ctx, target.org_id);
  const action = ctx.params[1];
  if (target.id === ctx.user.id) fail(400, 'You cannot change your own account here.');
  if (action === 'deactivate') { q('UPDATE users SET active = 0 WHERE id = ?').run(target.id); killUserSessions(target.id); }
  if (action === 'activate') q('UPDATE users SET active = 1, failed_logins = 0, locked_until = 0 WHERE id = ?').run(target.id);
  if (action === 'reset-mfa') { q('UPDATE users SET totp_enc = NULL, totp_pending_enc = NULL, totp_last_step = 0 WHERE id = ?').run(target.id); killUserSessions(target.id); }
  if (action === 'make-admin') q("UPDATE users SET role = 'admin' WHERE id = ?").run(target.id);
  if (action === 'make-member') q("UPDATE users SET role = 'member' WHERE id = ?").run(target.id);
  audit({ user: ctx.user, action: `user.${action}`, target: `user:${target.id}`, ip: ctx.ip });
  return { ok: true };
});

route('GET', '/api/admin/orgs', { auth: 'full', super: true }, () =>
  q(`SELECT o.*, (SELECT COUNT(*) FROM users u WHERE u.org_id = o.id AND u.active = 1) AS people FROM orgs o ORDER BY o.name`).all()
    .map((o) => ({ ...o, verified: !!o.verified, typeLabel: ORG_TYPES[o.type] })));

route('POST', '/api/admin/orgs', { auth: 'full', super: true }, (ctx) => {
  const name = str(ctx.body.name, 120, 'Organization name');
  const type = ORG_TYPES[ctx.body.type] ? ctx.body.type : fail(400, 'Choose an organization type.');
  const id = q('INSERT INTO orgs (name,type,phone,verified,created_at) VALUES (?,?,?,1,?)').run(name, type, str(ctx.body.phone, 40, 'Phone', false) || null, Date.now()).lastInsertRowid;
  audit({ user: ctx.user, action: 'org.created', target: `org:${id}`, ip: ctx.ip });
  return { id: Number(id) };
});

route('POST', '/api/admin/orgs/(\\d+)/(deactivate|activate|verify|unverify)', { auth: 'full', super: true }, (ctx) => {
  const id = Number(ctx.params[0]);
  const act = ctx.params[1];
  if (act === 'verify' || act === 'unverify') {
    q('UPDATE orgs SET verified = ? WHERE id = ?').run(act === 'verify' ? 1 : 0, id);
    audit({ user: ctx.user, action: `org.${act}`, target: `org:${id}`, ip: ctx.ip });
    return { ok: true };
  }
  if (id === ctx.user.org_id) fail(400, 'You cannot deactivate your own organization.');
  const on = act === 'activate';
  q('UPDATE orgs SET active = ? WHERE id = ?').run(on ? 1 : 0, id);
  if (!on) for (const u of q('SELECT id FROM users WHERE org_id = ?').all(id)) killUserSessions(u.id);
  audit({ user: ctx.user, action: `org.${ctx.params[1]}`, target: `org:${id}`, ip: ctx.ip });
  return { ok: true };
});

// Network admin: the "call them" list for faxes nobody opened.
route('GET', '/api/admin/followups', { auth: 'full', super: true }, () => ({
  items: q(`SELECT o.*, g.name AS org_name, g.type, g.phone, g.fax, g.no_fax, u.name AS sender_name, s.name AS sender_org, s.phone AS sender_phone, c.name AS called_by_name
            FROM outreach o JOIN orgs g ON g.id = o.org_id JOIN users u ON u.id = o.created_by JOIN orgs s ON s.id = u.org_id
            LEFT JOIN users c ON c.id = o.called_by
            WHERE o.claimed_at IS NULL AND g.claimed = 0 ORDER BY o.needs_call DESC, o.created_at`).all().map((o) => ({
    id: o.id, org: o.org_name, typeLabel: ORG_TYPES[o.type], phone: fax.pretty(o.phone), fax: fax.pretty(o.fax), noFax: !!o.no_fax,
    sender: `${o.sender_name}, ${o.sender_org}`, senderPhone: fax.pretty(o.sender_phone), createdAt: o.created_at,
    faxCount: o.fax_count, lastFaxAt: o.last_fax_at, opened: !!o.opened_at, needsCall: !!o.needs_call, waiting: waitingFor(o.org_id),
    calledAt: o.called_at, calledBy: o.called_by_name, note: o.call_note ? sec.decrypt(o.call_note) : null,
  })),
}));

route('POST', '/api/admin/followups/(\\d+)/(called|refax)', { auth: 'full', super: true }, async (ctx) => {
  const o = q('SELECT * FROM outreach WHERE id = ?').get(Number(ctx.params[0]));
  if (!o) fail(404, 'Not found');
  if (ctx.params[1] === 'called') {
    q('UPDATE outreach SET called_at = ?, called_by = ?, call_note = ? WHERE id = ?').run(Date.now(), ctx.user.id, sec.encrypt(str(ctx.body.note, 500, 'Note', false)), o.id);
    audit({ user: ctx.user, action: 'outreach.called', target: `org:${o.org_id}`, ip: ctx.ip });
  } else {
    const newFax = ctx.body.fax ? fax.normalizeUs(ctx.body.fax) : null;
    if (ctx.body.fax && !newFax) fail(400, 'Enter a 10-digit US fax number.');
    if (newFax) q('UPDATE orgs SET fax = ?, no_fax = 0 WHERE id = ?').run(newFax, o.org_id);
    await faxOutreach(q('SELECT * FROM outreach WHERE id = ?').get(o.id), true);
    audit({ user: ctx.user, action: 'outreach.refaxed', target: `org:${o.org_id}`, ip: ctx.ip });
  }
  return { ok: true };
});

route('GET', '/api/admin/audit', { auth: 'full', admin: true }, (ctx) => {
  const all = ctx.user.is_super && ctx.query.get('all') === '1';
  const rows = q(`SELECT a.id, a.at, a.action, a.target, a.ip, a.ok, u.name AS user_name, u.email AS user_email, o.name AS org_name
                  FROM audit a LEFT JOIN users u ON u.id = a.user_id LEFT JOIN orgs o ON o.id = a.org_id
                  ${all ? '' : 'WHERE a.org_id = ?'} ORDER BY a.id DESC LIMIT 1000`).all(...(all ? [] : [ctx.user.org_id]));
  const chain = store.verifyAuditChain(db);
  audit({ user: ctx.user, action: 'audit.viewed', target: all ? 'all' : `org:${ctx.user.org_id}`, ip: ctx.ip });
  return { rows, chain };
});

// ---------------- Static files ----------------
const PUBLIC = path.join(__dirname, 'public');
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon', '.webmanifest': 'application/manifest+json' };

function serveStatic(req, res, pathname) {
  const rel = pathname === '/' ? 'index.html' : pathname.slice(1);
  const file = path.normalize(path.join(PUBLIC, rel));
  if (!file.startsWith(PUBLIC + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
    res.writeHead(404, { ...baseHeaders(), 'Content-Type': 'text/plain' }); return res.end('Not found');
  }
  res.writeHead(200, { ...baseHeaders(), 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
  fs.createReadStream(file).pipe(res);
}

// ---------------- Dispatcher ----------------
async function handle(req, res) {
  const url = new URL(req.url, 'http://local');
  if (!url.pathname.startsWith('/api/')) {
    if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405); return res.end(); }
    return serveStatic(req, res, url.pathname);
  }
  const ip = clientIp(req);
  try {
    const r = routes.find((x) => x.method === req.method && x.re.test(url.pathname));
    if (!r) fail(404, 'Not found');
    if (req.method !== 'GET') {
      // CSRF defense (in addition to SameSite=Strict cookies): custom header + same-origin check.
      if (req.headers['x-simply-linked'] !== '1') fail(403, 'Blocked request.');
      const origin = req.headers.origin;
      if (origin && new URL(origin).host !== req.headers.host) fail(403, 'Blocked cross-site request.');
    }
    const ctx = { req, res, ip, query: url.searchParams, params: url.pathname.match(r.re).slice(1), body: req.method === 'GET' ? {} : await readBody(req) };
    if (r.opts.auth !== 'none') {
      const s = loadSession(req);
      if (s) { ctx.session = s; ctx.user = s.user; }
      if (r.opts.auth !== 'any') {
        if (!s) fail(401, 'Please sign in.');
        if (r.opts.auth === 'full' && !s.mfa_ok) fail(401, 'Finish two-step sign-in.');
        if (r.opts.admin && s.user.role !== 'admin') fail(403, 'Admins only.');
        if (r.opts.super && !s.user.is_super) fail(403, 'Network admins only.');
        if (!r.opts.stream) q('UPDATE sessions SET last_seen = ? WHERE id_hash = ?').run(Date.now(), s.id_hash);
      }
    }
    const out = await r.handler(ctx);
    if (!r.opts.stream) sendJson(res, 200, out ?? { ok: true });
  } catch (e) {
    if (e instanceof HttpError) return sendJson(res, e.status, { error: e.message });
    console.error(new Date().toISOString(), 'Internal error on', req.method, url.pathname, e.message); // never log bodies (PHI)
    if (!res.headersSent) sendJson(res, 500, { error: 'Something went wrong. Please try again.' });
  }
}

const server = http.createServer(handle);
server.headersTimeout = 20_000;
server.requestTimeout = 30_000;

if (require.main === module) {
  server.listen(CFG.port, CFG.host, () => {
    console.log(`Simply Linked running on http://${CFG.host}:${CFG.port}`);
    console.log(`  data: ${CFG.dataDir}  key: ${keySource}  MFA required: ${CFG.requireMfa}  secure cookies: ${CFG.secureCookie}`);
    if (keySource === 'dev-file') console.log('  WARNING: development key file in use. Set SL_DATA_KEY (and NODE_ENV=production) before storing real patient data.');
    if (!CFG.secureCookie) console.log('  WARNING: secure cookies off (local development). Production must run behind HTTPS.');
  });
}

module.exports = { server, CFG };
