# HIPAA: what the software does, and what you must do

Software alone cannot be "HIPAA compliant". Compliance comes from the software **plus** how it's hosted, the agreements you sign, and your policies. This page shows both halves.

## What Simply Linked does (technical safeguards, 45 CFR 164.312)

| Requirement | How it's implemented |
|---|---|
| **Access control:** unique user IDs | Every person has their own account; organizations share an inbox but every action is tied to a person. |
| **Access control:** only see what you should | A conversation is visible only to the organizations on it. Other organizations get "not found" (and the attempt is logged). Network admins *cannot* read other organizations' messages. |
| **Automatic logoff** | 15 minutes idle (configurable), with a 1-minute warning; sessions end after 12 hours regardless. |
| **Encryption at rest** | Message text, subjects, patient names, call notes and 2-step secrets are encrypted with AES-256-GCM before they reach the database. The key comes from `SL_DATA_KEY` (keep it in a secret manager, not with the database). |
| **Encryption in transit** | Run behind HTTPS (TLS 1.2+). In production, cookies are `Secure`, `__Host-` prefixed and HSTS is sent. |
| **Person authentication** | Passwords: 12+ characters, hashed with scrypt. Two-step sign-in (TOTP authenticator app) is required from the second sign-in on. Accounts lock for 15 minutes after 5 failed attempts. Per-IP throttling. |
| **Audit controls** | Every sign-in, failed sign-in, inbox view, conversation view, message sent, "Got it", invite, user change, fax and audit-log view is recorded with who, when and IP. The log is **append-only** (database triggers block edits and deletes) and **hash-chained**, with a tamper check shown on the Team page. It **never contains message content**. CSV export is available. |
| **Integrity** | Messages can't be edited or deleted after sending. AES-GCM detects tampering with stored ciphertext. |
| **Emergency access & termination** | Admins remove a person's access instantly (all sessions end at once). |
| **Minimum necessary** | Fax notices, live-update events and logs contain **no patient information**. The app never stores PHI in browser storage and sends `Cache-Control: no-store`. |
| **Web security** | Strict Content-Security-Policy (no inline scripts), CSRF protection (SameSite=Strict cookies + required header + origin check), clickjacking protection, no third-party code (zero npm dependencies). |

## What YOU must do before real patient data

1. **Host on HIPAA-eligible infrastructure and sign a BAA** with the host (e.g. AWS, Google Cloud, Azure; all offer BAAs). Use encrypted disks and encrypted backups.
2. **Sign BAAs with every vendor that touches PHI:** fax provider (e.g. Sinch/Phaxio, Documo, SRFax; set `SL_FAX_PROVIDER`), email/SMS, backups, monitoring.
3. **Sign a BAA with each customer organization.** You (the operator) are their Business Associate. Add a click-through BAA to sign-up (see ROADMAP Phase 1).
4. **Set production config:** `NODE_ENV=production`, `SL_DATA_KEY` from a secret manager, `SL_BASE_URL=https://...`, HTTPS termination, `SL_TRUST_PROXY=true` behind a load balancer.
5. **Do a written risk analysis** (164.308(a)(1)), and appoint a Privacy Officer and a Security Officer.
6. **Write policies:** workforce training, sanctions, incident response, **breach notification** (60 days), contingency/backup and restore testing, data retention, device use.
7. **Back up the database and the key separately**, and test restores.
8. **Penetration test and code review** by a third party before launch; then SOC 2 / HITRUST as you grow.
9. **Review with healthcare counsel:** BAA, terms, privacy notice, fax practice (TCPA), state laws, 42 CFR Part 2.

## Data retention
Messages are kept as part of the care communication record. Set a retention policy with counsel (many states require medical-record retention for 6–10 years) and add scheduled purge or export before launch.
