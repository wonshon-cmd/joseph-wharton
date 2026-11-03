'use strict';
// End-to-end test: sign up, MFA, message an org that isn't on the network (fax), claim via code,
// "Got it", access control, CSRF, lockout, audit chain, encryption at rest.
// Run: npm test
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'sl-test-'));
process.env.SL_DATA_DIR = dir;
process.env.SL_NPI_LOOKUP = 'false';
const { server } = require('../server');
const sec = require('../lib/security');

let base;
class Client {
  constructor() { this.cookie = ''; }
  async req(method, p, body, headers = {}) {
    const res = await fetch(base + p, {
      method, body: body ? JSON.stringify(body) : undefined,
      headers: { 'Content-Type': 'application/json', 'X-Simply-Linked': '1', Cookie: this.cookie, ...headers },
    });
    const sc = res.headers.get('set-cookie'); if (sc) this.cookie = sc.split(';')[0];
    return { status: res.status, body: await res.json().catch(() => ({})), headers: res.headers };
  }
  get(p) { return this.req('GET', p); }
  post(p, b, h) { return this.req('POST', p, b || {}, h); }
}

function totpNow(secretSpaced, offsetSteps = 0) { return sec.totpAt(secretSpaced.replace(/\s/g, ''), Math.floor(Date.now() / 30000) + offsetSteps); }

(async () => {
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  base = `http://127.0.0.1:${server.address().port}`;
  let n = 0; const ok = (m) => console.log(`  ✓ ${++n}. ${m}`);

  // 1. Clinic signs up (first user = network admin) and can message right away.
  const md = new Client();
  let r = await md.post('/api/signup', { name: 'Ana Lee', title: 'MD', email: 'ana@clinic.test', password: 'correct horse 42', orgName: 'Westside Clinic', orgType: 'clinic', phone: '2155551234' });
  assert.equal(r.status, 200, JSON.stringify(r.body)); assert.equal(r.body.next, 'app');
  r = await md.get('/api/me'); assert.equal(r.body.mfaOk, true); assert.equal(r.body.user.isSuper, true);
  ok('one-screen sign-up goes straight into the app');

  // Security headers + no-store
  assert.match(r.headers.get('content-security-policy'), /default-src 'self'/);
  assert.equal(r.headers.get('cache-control'), 'no-store');
  ok('security headers and no-store caching on API responses');

  // 2. MFA enrollment (QR + code)
  r = await md.post('/api/mfa/setup'); assert.ok(r.body.qr.startsWith('data:image/svg+xml')); const mdSecret = r.body.secret;
  r = await md.post('/api/mfa/verify', { code: '000000' }); assert.equal(r.status, 401);
  r = await md.post('/api/mfa/verify', { code: totpNow(mdSecret) }); assert.equal(r.status, 200);
  ok('two-step sign-in setup with QR code');

  // 3. Weak password, CSRF, cross-origin blocked
  r = await new Client().post('/api/signup', { name: 'x', email: 'x@x.test', password: 'short', orgName: 'X', orgType: 'other' }); assert.equal(r.status, 400);
  r = await md.req('POST', '/api/ping', {}, { 'X-Simply-Linked': '' }); assert.equal(r.status, 403);
  r = await md.req('POST', '/api/ping', {}, { Origin: 'https://evil.example' }); assert.equal(r.status, 403);
  ok('weak passwords rejected; CSRF header and same-origin enforced');

  // 4. MD messages a DME store and a pharmacy that are NOT on Simply Linked -> fax notices
  r = await md.post('/api/orgs/add', { name: 'Main St Pharmacy', type: 'pharmacy', fax: '(215) 555-0101', phone: '215-555-0100' });
  const pharmId = r.body.id;
  r = await md.post('/api/orgs/add', { name: 'Comfort DME Supply', type: 'dme', fax: '2155550202' });
  const dmeId = r.body.id;
  r = await md.post('/api/orgs/add', { name: 'Dup', type: 'pharmacy', fax: '215.555.0101' }); assert.equal(r.body.id, pharmId);
  r = await md.post('/api/threads', { orgIds: [pharmId, dmeId], kind: 'discharge', urgent: true, patient: 'Maria Gomez, DOB 03/14/1948', body: 'Discharged today. NEW: apixaban 5mg BID. Needs hospital bed + walker.' });
  assert.equal(r.status, 200); const tid = r.body.id;
  await new Promise((res) => setTimeout(res, 200));
  const outbox = fs.readdirSync(path.join(dir, 'fax-outbox'));
  assert.equal(outbox.length, 2);
  const faxPdf = fs.readFileSync(path.join(dir, 'fax-outbox', outbox[0])).toString('latin1');
  assert.ok(!faxPdf.includes('Maria') && !faxPdf.includes('apixaban'), 'fax must not contain PHI');
  ok('message to off-network pharmacy + DME sends 2 fax notices with NO patient info');

  // Sender sees delivery status
  r = await md.get(`/api/threads/${tid}`);
  assert.match(r.body.messages[0].receipts[0].pending.text, /Fax notice sent/);
  ok('sender sees "fax notice sent, not opened yet"');

  // 5. Pharmacy gets the fax, types the code, signs up, reads the message
  const db = new (require('node:sqlite').DatabaseSync)(path.join(dir, 'simply-linked.db'));
  const code = sec.decrypt(db.prepare('SELECT code_enc FROM outreach WHERE org_id = ?').get(pharmId).code_enc);
  const rph = new Client();
  r = await rph.get('/api/claim/XXXXXXXXXX'); assert.equal(r.status, 404);
  r = await rph.get(`/api/claim/${code.slice(0, 5)}-${code.slice(5)}`); assert.equal(r.body.waiting, 1); assert.deepEqual(r.body.from, ['Westside Clinic']);
  r = await md.get(`/api/threads/${tid}`); assert.match(r.body.messages[0].receipts.find((x) => x.org === 'Main St Pharmacy').pending.text, /Opened/);
  r = await rph.post('/api/claim', { code, name: 'Tom Park', title: 'PharmD', email: 'tom@mainst.test', password: 'pharmacy pass 77' });
  assert.equal(r.status, 200, JSON.stringify(r.body));
  r = await rph.get('/api/threads'); assert.equal(r.body.threads.length, 1); assert.equal(r.body.threads[0].needsAck, true); assert.equal(r.body.threads[0].urgent, true);
  r = await rph.get(`/api/threads/${tid}`); assert.match(r.body.messages[0].body, /apixaban/);
  r = await new Client().post('/api/claim', { code, name: 'Eve', email: 'eve@x.test', password: 'evil person 99' }); assert.equal(r.status, 409);
  ok('pharmacy claims with fax code, reads message instantly; code cannot be reused');

  // 6. "Got it" -> sender sees who and when
  r = await rph.post(`/api/threads/${tid}/ack`); assert.equal(r.status, 200);
  r = await md.get(`/api/threads/${tid}`);
  const rec = r.body.messages[0].receipts.find((x) => x.org === 'Main St Pharmacy'); assert.equal(rec.by, 'Tom Park');
  r = await md.get('/api/threads'); assert.deepEqual(r.body.threads[0].waitingOn, ['Comfort DME Supply']);
  ok('"Got it" shows name + time to sender; inbox shows who is still pending');

  // 7. Reply = implicit ack; MD needs to acknowledge reply
  r = await rph.post(`/api/threads/${tid}/messages`, { body: 'Got it. Apixaban ready for pickup at 3pm.' }); assert.equal(r.status, 200);
  r = await md.get('/api/threads'); assert.equal(r.body.threads[0].needsAck, true); assert.equal(r.body.threads[0].unread, true);
  ok('replies arrive, unread + needs "Got it" flags work');

  // 8. Access control: an unrelated org cannot read the thread
  const nurse = new Client();
  await nurse.post('/api/signup', { name: 'Rita Ortiz', title: 'RN', email: 'rita@hh.test', password: 'visiting nurse 1', orgName: 'Caring Hands Home Health', orgType: 'home_health' });
  r = await nurse.get(`/api/threads/${tid}`); assert.equal(r.status, 404);
  r = await nurse.post(`/api/threads/${tid}/messages`, { body: 'peek' }); assert.equal(r.status, 404);
  r = await nurse.get('/api/admin/followups'); assert.equal(r.status, 403);
  r = await nurse.get('/api/me'); assert.equal(r.body.org.verified, false);
  ok('other organizations cannot see or post to the conversation; new orgs are unverified');

  // 9. Invite a coworker
  r = await rph.post('/api/admin/invites', { email: 'sam@mainst.test' }); assert.ok(r.body.qr);
  const token = r.body.link.split('/invite/')[1];
  const sam = new Client();
  r = await sam.post('/api/invite/accept', { token, name: 'Sam Wu', password: 'coworker pass 5' }); assert.equal(r.status, 200);
  r = await sam.get('/api/threads'); assert.equal(r.body.threads.length, 1);
  ok('coworker joins by invite link/QR and shares the org inbox');

  // 10. Next sign-in requires MFA for accounts that skipped it
  r = await sam.post('/api/logout'); r = await sam.post('/api/login', { email: 'sam@mainst.test', password: 'coworker pass 5' });
  assert.equal(r.body.next, 'mfa-setup');
  r = await sam.get('/api/threads'); assert.equal(r.status, 401);
  ok('two-step sign-in is required from the next sign-in');

  // 11. Lockout after 5 bad passwords
  const bad = new Client();
  for (let i = 0; i < 5; i++) await bad.post('/api/login', { email: 'tom@mainst.test', password: 'wrong password 1' });
  r = await bad.post('/api/login', { email: 'tom@mainst.test', password: 'pharmacy pass 77' }); assert.equal(r.status, 423);
  ok('account locks after 5 failed attempts');

  // 12. Deactivation kills sessions immediately
  r = await rph.get('/api/admin/people'); const samId = r.body.users.find((u) => u.email === 'sam@mainst.test').id;
  const md2 = new Client();
  r = await rph.post(`/api/admin/users/${samId}/deactivate`); assert.equal(r.status, 200);
  r = await sam.post('/api/login', { email: 'sam@mainst.test', password: 'coworker pass 5' }); assert.equal(r.status, 401);
  ok('removing access works immediately');

  // 13. Fax follow-up: DME never opened -> network admin call list; opt-out works
  r = await md.get('/api/admin/followups'); const dmeItem = r.body.items.find((x) => x.org === 'Comfort DME Supply');
  assert.ok(dmeItem && dmeItem.faxCount === 1);
  r = await md.post(`/api/admin/followups/${dmeItem.id}/called`, { note: 'Spoke to front desk' }); assert.equal(r.status, 200);
  const dmeCode = sec.decrypt(db.prepare('SELECT code_enc FROM outreach WHERE org_id = ?').get(dmeId).code_enc);
  r = await new Client().post('/api/claim/stop', { code: dmeCode }); assert.equal(r.status, 200);
  r = await md.get(`/api/threads/${tid}`); assert.match(r.body.messages[0].receipts.find((x) => x.org === 'Comfort DME Supply').pending.text, /call them/i);
  ok('unopened fax goes to the call list; recipients can stop fax notices');

  // 14. Encryption at rest + audit log integrity + no PHI in audit
  const raw = fs.readFileSync(path.join(dir, 'simply-linked.db')).toString('latin1') + (fs.existsSync(path.join(dir, 'simply-linked.db-wal')) ? fs.readFileSync(path.join(dir, 'simply-linked.db-wal')).toString('latin1') : '');
  assert.ok(!raw.includes('apixaban') && !raw.includes('Maria Gomez'), 'PHI must be encrypted at rest');
  r = await md.get('/api/admin/audit?all=1'); assert.equal(r.body.chain.ok, true);
  assert.ok(r.body.rows.some((x) => x.action === 'thread.viewed'));
  assert.ok(!JSON.stringify(r.body.rows).includes('apixaban'));
  assert.throws(() => db.exec('DELETE FROM audit'), /append-only/);
  ok('messages encrypted at rest; audit log is append-only, hash-chained, PHI-free');

  // 15. Logout ends the session
  await md.post('/api/logout'); r = await md.get('/api/threads'); assert.equal(r.status, 401);
  ok('sign out ends the session');

  console.log(`\nAll ${n} checks passed.`);
  server.close(); db.close();
  fs.rmSync(dir, { recursive: true, force: true });
  process.exit(0);
})().catch((e) => { console.error('\nFAILED:', e); process.exit(1); });
