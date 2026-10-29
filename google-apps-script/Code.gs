/**
 * Joseph Wharton: Google save spot for practice records.
 *
 * Stores every device's progress in ONE JSON file in your Google Drive
 * ("joseph-wharton-progress.json"), plus a daily backup copy.
 * The website reads it (GET) and saves to it (POST). It's the same idea as the
 * Pivot or Perish "permanent board".
 *
 * Deploy: Deploy → New deployment → type "Web app" →
 *         Execute as: Me · Who has access: Anyone → Deploy → copy the /exec URL.
 */
const FILE_NAME = 'joseph-wharton-progress.json';
const BACKUP_PREFIX = 'joseph-wharton-progress-backup-';

function getFile_() {
  const it = DriveApp.getFilesByName(FILE_NAME);
  if (it.hasNext()) return it.next();
  return DriveApp.createFile(FILE_NAME, JSON.stringify({ rev: 0, data: { keys: {} } }), 'application/json');
}

function read_() {
  try { return JSON.parse(getFile_().getBlob().getDataAsString()); }
  catch (e) { return { rev: 0, data: { keys: {} } }; }
}

function out_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function backup_(text) {
  // keep one backup per day (overwritten during the day)
  const name = BACKUP_PREFIX + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd') + '.json';
  const it = DriveApp.getFilesByName(name);
  if (it.hasNext()) it.next().setContent(text); else DriveApp.createFile(name, text, 'application/json');
}

// GET → { ok, rev, data }
function doGet(e) {
  const s = read_();
  return out_({ ok: true, rev: s.rev || 0, data: s.data || { keys: {} } });
}

// POST (plain text body: { baseRev, data }) → saves only if nobody else saved in between
function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const body = JSON.parse(e.postData.contents);
    const s = read_();
    const rev = s.rev || 0;
    if (body.baseRev !== rev) return out_({ ok: false, conflict: true, rev: rev, data: s.data || { keys: {} } });
    const next = { rev: rev + 1, saved: new Date().toISOString(), data: body.data || { keys: {} } };
    const text = JSON.stringify(next);
    getFile_().setContent(text);
    backup_(text);
    return out_({ ok: true, rev: next.rev });
  } catch (err) {
    return out_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

// Run this once from the editor (▶ Run) to grant Drive access before deploying.
function setup() { getFile_(); }
