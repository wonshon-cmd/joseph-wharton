'use strict';
// Outbound fax notices. The fax page NEVER contains patient information: only who is trying to reach
// the recipient, a link, and a one-time code. (Minimum necessary; a misdialed fax discloses no PHI.)
//
// Providers:
//   SL_FAX_PROVIDER=outbox  (default) writes each fax as a PDF to <data>/fax-outbox/ for development/testing.
//   SL_FAX_PROVIDER=phaxio  sends via the Phaxio/Sinch Fax API (sign their BAA first). Needs
//                           SL_FAX_API_KEY, SL_FAX_API_SECRET. Optional SL_FAX_FROM (caller id).
const fs = require('node:fs');
const path = require('node:path');

const PROVIDER = process.env.SL_FAX_PROVIDER || 'outbox';

/** Normalizes a US fax/phone number to E.164 (+1XXXXXXXXXX). Returns null if invalid. */
function normalizeUs(num) {
  let d = String(num || '').replace(/\D/g, '');
  if (d.length === 11 && d.startsWith('1')) d = d.slice(1);
  return /^[2-9]\d{2}[2-9]\d{6}$/.test(d) ? `+1${d}` : null;
}
const pretty = (e164) => { const d = String(e164 || '').replace(/\D/g, '').slice(-10); return d.length === 10 ? `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}` : ''; };

// ---------- Tiny one-page PDF writer (Helvetica, text only) ----------
function pdfEscape(s) { return String(s).replace(/[^\x20-\x7e]/g, '?').replace(/([\\()])/g, '\\$1'); }

/** lines: [{ text, size, bold, gap }]; qr: optional { size, modules } from lib/qr (drawn as vector squares). */
function makePdf(lines, qr) {
  let y = 740; let content = 'BT\n';
  for (const l of lines) {
    y -= l.gap ?? Math.round((l.size || 12) * 1.5);
    content += `/${l.bold ? 'F2' : 'F1'} ${l.size || 12} Tf 1 0 0 1 60 ${y} Tm (${pdfEscape(l.text)}) Tj\n`;
  }
  content += 'ET\n';
  if (qr) {
    const box = 150, left = 410, top = 565, cell = box / qr.size;
    content += '0 0 0 rg\n';
    qr.modules.forEach((row, r) => row.forEach((on, c) => {
      if (on) content += `${(left + c * cell).toFixed(2)} ${(top - (r + 1) * cell).toFixed(2)} ${cell.toFixed(2)} ${cell.toFixed(2)} re f\n`;
    }));
    content += `BT /F2 11 Tf 1 0 0 1 ${left + 4} ${top - box - 18} Tm (Scan with your phone camera) Tj ET\n`;
  }
  const objs = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>',
    `<< /Length ${Buffer.byteLength(content)} >>\nstream\n${content}endstream`,
  ];
  let out = '%PDF-1.4\n'; const offsets = [];
  objs.forEach((o, i) => { offsets.push(Buffer.byteLength(out)); out += `${i + 1} 0 obj\n${o}\nendobj\n`; });
  const xref = Buffer.byteLength(out);
  out += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n` + offsets.map((o) => `${String(o).padStart(10, '0')} 00000 n \n`).join('');
  out += `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return Buffer.from(out, 'latin1');
}

/** Builds the notice. `info` = { toName, fromOrg, fromPerson, fromPhone, count, code, link, siteUrl, reminder } */
function noticeLines(info) {
  const code = info.code.replace(/(.{5})(.{5})/, '$1-$2');
  return [
    { text: 'SIMPLY LINKED', size: 26, bold: true, gap: 0 },
    { text: 'Secure messaging between care teams', size: 12, gap: 22 },
    { text: info.reminder ? 'REMINDER: a secure message is still waiting for you' : 'You have a secure message waiting', size: 18, bold: true, gap: 50 },
    { text: `To:   ${info.toName}`, size: 13, gap: 34 },
    { text: `From: ${info.fromPerson}, ${info.fromOrg}${info.fromPhone ? '  ' + pretty(info.fromPhone) : ''}`, size: 13 },
    { text: `${info.count} message${info.count === 1 ? '' : 's'} waiting about a shared patient.`, size: 13 },
    { text: 'HOW TO READ IT (takes about 1 minute, free):', size: 14, bold: true, gap: 44 },
    { text: 'Scan the QR code with your phone, or:', size: 12, gap: 24 },
    { text: `1.  Go to  ${info.siteUrl}`, size: 13, gap: 24 },
    { text: '2.  Click  "I got a fax"  and type:', size: 13 },
    { text: code, size: 30, bold: true, gap: 46 },
    { text: '3.  Create your account. The message opens right away.', size: 13, gap: 40 },
    { text: `Or open this link directly:  ${info.link}`, size: 10, gap: 30 },
    { text: 'Reply in the app so the sender knows you received it.', size: 12, gap: 34 },
    { text: 'For privacy, this fax does not contain any patient information.', size: 10, gap: 60 },
    { text: 'If you received this fax by mistake, please discard it. The code expires in 30 days.', size: 10 },
    { text: 'To stop these fax notices: enter the code on the website and choose "Stop fax notices".', size: 10 },
    { text: 'Questions about this message? Call the sender at the number above.', size: 10 },
  ];
}

async function send({ to, info, dataDir }) {
  const pdf = makePdf(noticeLines(info), info.qr);
  if (PROVIDER === 'outbox') {
    const dir = path.join(dataDir, 'fax-outbox');
    fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
    const file = path.join(dir, `${new Date().toISOString().replace(/[:.]/g, '-')}_${to.replace(/\D/g, '')}.pdf`);
    fs.writeFileSync(file, pdf, { mode: 0o600 });
    return { ok: true, provider: 'outbox', detail: path.basename(file) };
  }
  if (PROVIDER === 'phaxio') {
    const form = new FormData();
    form.append('to', to);
    if (process.env.SL_FAX_FROM) form.append('caller_id', process.env.SL_FAX_FROM);
    form.append('file', new Blob([pdf], { type: 'application/pdf' }), 'simply-linked-notice.pdf');
    const auth = Buffer.from(`${process.env.SL_FAX_API_KEY}:${process.env.SL_FAX_API_SECRET}`).toString('base64');
    try {
      const res = await fetch(process.env.SL_FAX_API_URL || 'https://api.phaxio.com/v2/faxes', { method: 'POST', body: form, headers: { Authorization: `Basic ${auth}` }, signal: AbortSignal.timeout(20000) });
      const j = await res.json().catch(() => ({}));
      return { ok: res.ok && j.success !== false, provider: 'phaxio', detail: j.data?.id ? `fax id ${j.data.id}` : (j.message || `HTTP ${res.status}`) };
    } catch (e) { return { ok: false, provider: 'phaxio', detail: e.message }; }
  }
  return { ok: false, provider: PROVIDER, detail: 'Unknown SL_FAX_PROVIDER' };
}

module.exports = { send, normalizeUs, pretty, makePdf, noticeLines, PROVIDER };
