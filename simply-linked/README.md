# Simply Linked

**Simple, HIPAA-ready text messaging between every provider a patient depends on:** clinics, hospitals, pharmacies, DME suppliers, visiting nurses / home health, day cares, nursing facilities.

> An MD discharging a patient sends **one message** to the pharmacy, the DME store and the visiting nurse.
> Each one taps **"Got it"**, and the MD sees who confirmed and when.
> If the pharmacy isn't on Simply Linked yet, **we fax them** a notice (no patient info) with a QR code. They scan it, sign up in about a minute, and the message is waiting.
> If they don't open it, we re-fax, then put them on a call list for a person to follow up.

Messaging is free, forever. See **[ROADMAP.md](ROADMAP.md)** for the adoption strategy (WhatsApp/Telegram playbook, reasons for each provider type to sign up, go-to-market, business model) and **[HIPAA.md](HIPAA.md)** for compliance.

## Features
- **One-screen sign-up**, straight into the inbox. Optional NPI auto-fills and **verifies** the organization against the national NPI Registry.
- **Care-team conversations** with any number of organizations, plus patient name/DOB, urgent flag, and quick templates (Discharge, Medication change, Refill, Equipment/DME, Visit update, Question).
- **"Got it" receipts** for each organization, per message. Replying counts as "Got it". Filters for *Needs "Got it"* and *Waiting on others*.
- **Reach anyone:** search the directory or the national NPI Registry (which includes fax numbers), or type a fax number.
- **Fax bridge:** a PHI-free notice with a QR code and a code, automatic reminder faxes, a call list for the network admin, and opt-out.
- **Shared organization inbox**; invite coworkers by link or QR.
- **Live updates**, installable to the home screen, works on phones.
- **Security:** two-step sign-in (QR setup), AES-256-GCM encryption at rest, 15-minute auto sign-out, lockout, an append-only hash-chained audit log, strict CSP, CSRF protection, **zero third-party dependencies**.

## Run it

Needs **Node.js 22.5+** (uses the built-in `node:sqlite`). Nothing to install.

```bash
cd simply-linked
npm start
```

Open http://127.0.0.1:3000. The **first account created becomes the network admin**, who sees the fax follow-up call list and can verify organizations.

In development, fax notices are saved as PDFs in `data/fax-outbox/` instead of being sent.

```bash
npm test
```

The test runs the whole flow end to end: sign up, two-step sign-in, faxing off-network recipients with no PHI on the page, claiming by code, "Got it", access control, CSRF, lockout, encryption at rest and the audit chain.

## Configuration

| Variable | Default | Meaning |
|---|---|---|
| `NODE_ENV` | | `production` turns on secure cookies/HSTS and requires `SL_DATA_KEY` |
| `SL_DATA_KEY` | dev key file | 32-byte base64 encryption key (`openssl rand -base64 32`). **Keep it in a secret manager.** |
| `SL_BASE_URL` | from request | Public URL used in fax notices and invite links, e.g. `https://app.simplylinked.com` |
| `PORT` / `HOST` | `3000` / `127.0.0.1` | Listen address |
| `SL_DATA_DIR` | `./data` | Database folder |
| `SL_TRUST_PROXY` | `false` | Set `true` behind a load balancer (uses `X-Forwarded-For`) |
| `SL_IDLE_MINUTES` | `15` | Automatic sign-out |
| `SL_SESSION_HOURS` | `12` | Maximum session length |
| `SL_REQUIRE_MFA` | `true` | Require two-step sign-in from the second sign-in |
| `SL_FAX_PROVIDER` | `outbox` | `outbox` (save PDFs locally) or `phaxio` (Sinch/Phaxio API; **sign their BAA**) |
| `SL_FAX_API_KEY` / `SL_FAX_API_SECRET` / `SL_FAX_FROM` | | Fax provider credentials / caller ID |
| `SL_FAX_REMINDER_HOURS` | `4` | Re-fax unopened notices after this long |
| `SL_FAX_MAX` | `3` | Maximum fax notices per organization |
| `SL_CALL_AFTER_HOURS` | `24` | Then add the organization to the call list |
| `SL_NPI_LOOKUP` | `true` | Use the public CMS NPI Registry for search and verification |

## Files
```
server.js          HTTP server, API, sessions, fax outreach, follow-up worker
lib/security.js    AES-256-GCM, scrypt passwords, TOTP two-step sign-in
lib/db.js          SQLite schema, append-only hash-chained audit log
lib/fax.js         PHI-free fax notice (PDF with QR) + fax providers
lib/qr.js          QR code encoder (no dependencies)
lib/npi.js         CMS NPI Registry lookup and search
public/            The app (plain HTML/CSS/JS, no frameworks)
test/smoke.js      End-to-end tests
```

> Before using real patient data, complete the checklist in [HIPAA.md](HIPAA.md): HIPAA hosting with a BAA, a fax vendor BAA, customer BAAs, HTTPS, a risk analysis and policies.
