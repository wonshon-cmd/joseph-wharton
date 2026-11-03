# Simply Linked: Adoption Strategy & Roadmap

**Goal: every provider a patient depends on can reach every other provider, in one tap, for free.**
Wide adoption matters more than anything else, so every decision below favors *more providers connected* over *more features* or *more revenue*.

---

## 1. The problem (why this wins)

When a patient is discharged, the MD needs to tell the pharmacy about new meds, the DME store about a hospital bed, the visiting nurse about wound care, and the day care about the new schedule. Today that happens by **fax, phone tag, and voicemail**. Nobody knows if the other side got it. Staff often fall back on personal texting, which is not HIPAA-compliant.

There is no shared, simple, free channel *across* organizations. EHR messaging only works inside one system. Simply Linked is the channel between them.

---

## 2. What WhatsApp & Telegram did, and how we copy it

| What made WhatsApp / Telegram spread | How Simply Linked does it |
|---|---|
| **Used an identity everyone already had** (your phone number). No usernames, no searching. | We use the identities every provider already has: **NPI number and fax number**. The directory is pre-filled from the national NPI Registry, so you can find *every* US pharmacy, DME, home-health agency and clinic on day one. |
| **Your contacts were "already there."** Empty networks die. | Even providers who haven't joined show up and can be messaged. **The network feels full from the first minute.** |
| **Every message to a non-user became an invite** ("Join me on WhatsApp" SMS). | **Fax bridge:** message anyone; if they're not on Simply Linked we fax them a no-patient-info notice with a QR code and a code. **Every message is an invitation, sent through a channel they already watch.** ✅ built |
| **Free.** WhatsApp charged $0.99/yr and then dropped even that. | **Messaging is free forever, for everyone.** We never charge the receiving side. We charge only for optional power features (section 6). |
| **Instant onboarding.** Install, verify number, chat. | One screen to sign up, straight into the inbox. Fax recipients scan a QR code and read the message in about a minute. Coworkers join by link or QR. ✅ built |
| **Did one thing perfectly.** No ads, no clutter. | Text messages, "Got it" receipts, care-team threads. Nothing else on the main screen. |
| **Blue ticks:** you *know* it was read. | **"Got it" button:** the sender sees *who* confirmed and *when*. Unconfirmed messages are flagged, re-faxed, and then followed up by phone. ✅ built |
| **Groups** pulled whole communities in at once. | **Care-team threads:** one conversation with the MD + pharmacy + DME + nurse + day care for a patient. Adding one org to a thread brings that org into the network. ✅ built |
| **Telegram's open bots & API** let others build on it. | Open API + integrations: EHR (FHIR), eFax inbound, pharmacy systems (section 5). |
| **Spread city by city, cluster by cluster** (campus to campus, country to country). | Launch **one local care network at a time** (section 4). Density beats breadth. |
| **Works on any phone.** | Works in any browser and installs to the home screen (PWA). Native apps follow for push notifications. |

---

## 3. Reasons for each provider to download it

Each group gets one sentence it cares about, and that sentence goes on the fax, the landing page and every pitch.

| Who | Their pain today | Why they'll sign up |
|---|---|---|
| **MD / Clinic / Hospital discharge** | Phone tag with pharmacies and agencies; readmissions (Medicare penalizes them) when instructions get lost | "Send discharge instructions to the whole team in one message and **see proof each one got it.**" |
| **Pharmacy** | Unreadable faxes, holds to reach the prescriber, clarifications take days | "**Clarify a prescription in minutes**, not days. No more hold music." |
| **DME supplier** | Chasing missing paperwork (orders, CMNs, face-to-face notes) delays delivery *and payment* | "**Get the documents you need to deliver and get paid faster.**" |
| **Visiting nurse / Home health** | Hard to reach the MD about vitals and concerns; orders unsigned for weeks | "Report a concern and **get an answer the same day.**" |
| **Day care (adult & child)** | Never told about med changes or new care plans | "**Be in the loop** when a client's meds or care plan change." |
| **Everyone** | Personal texting is a HIPAA risk; fax is slow and unaccountable | **Free, HIPAA-compliant, nothing to install, every message logged to protect you.** |

---

## 4. Go-to-market: grow one local network at a time

**The "atomic network":** 1 hospital or large clinic, plus the ~20 pharmacies, ~5 DME suppliers, ~5 home-health agencies and ~5 day cares its patients actually use. When those ~35 organizations are connected, the network is useful every day, and nearby providers join because their partners are already on it.

1. **Start with the senders.** Discharge planners, care coordinators and transition-of-care nurses send the most messages. Recruit 1–2 hospitals or large practices as anchor users.
2. **The fax bridge recruits the receivers automatically.** Every discharge message to an off-network pharmacy or DME is an invitation. Track the *fax → sign-up* conversion rate and keep improving the fax page.
3. **Human follow-up (built in).** If a fax isn't opened, the app re-faxes and then puts the organization on a call list. A friendly 2-minute call ("Westside Clinic sent you a discharge note for a shared patient") converts very well. The call list, logging and re-fax are ✅ built.
4. **Champions.** Pick one enthusiastic person per organization (pharmacist, office manager, intake coordinator). Give them recognition, a "Founding member" badge and early access to features. Avoid cash-for-referral schemes, which can raise Anti-Kickback concerns in healthcare.
5. **Associations & communities:** state pharmacy associations, independent pharmacy co-ops, home-health associations, DME associations, ACOs, and hospital readmission-reduction programs.
6. **Prove value with numbers:** time to acknowledgment, phone calls avoided, faxes replaced, readmissions. Share them with anchor hospitals.
7. **Then the next city.** Repeat with a new anchor hospital. Organizations already connected in one city pull in their partners in the next.

### Metrics that matter
- Weekly active organizations (north star)
- % of messages that get "Got it" within 1 hour
- Fax notice → sign-up conversion rate, and median time to open
- Messages per active organization per week
- Number of organizations each new organization brings in (viral coefficient; target > 1)

---

## 5. Product roadmap

### Phase 1: Pilot (now to 3 months) ✅ mostly built
- One-screen sign-up, care-team threads, "Got it" receipts, urgent flag, message templates (Discharge, Med change, Refill, Equipment/DME, Visit update)
- Fax bridge with QR code and code, automatic re-fax, call list, fax opt-out
- NPI Registry search and auto-verification
- Coworker invites by link/QR, shared organization inbox
- Two-step sign-in, encryption, audit log, auto sign-out
- **Before launch:** click-through **BAA** at sign-up, real fax provider under a BAA, HIPAA hosting (see `HIPAA.md`)

### Phase 2: Make it daily (3 to 9 months)
- **Push notifications** (native iOS/Android wrappers) and email/SMS "you have a new message" alerts with **no patient info**
- **Inbound fax-to-chat:** give each organization a free Simply Linked fax number. Incoming faxes land in the inbox as messages, so organizations can drop their fax machine. *This is the biggest reason to switch.*
- **Reply-by-fax:** recipients who refuse to sign up can still reply on a fax-back form, so no sender ever hits a dead end
- File attachments (PDF orders, CMNs, discharge summaries) with the same encryption
- Search, patient filter, "my patients" view, read status per person
- Directory profiles: hours, after-hours phone, services (e.g. "delivers hospital beds", "24h pharmacy")
- Response-time badges ("usually replies in 15 min"), which push everyone to be responsive

### Phase 3: Become the standard (9 to 18 months)
- **EHR integration** (FHIR / SMART on FHIR) for Epic, Cerner/Oracle, athena, eClinicalWorks: "Send to care team" from inside the chart, and discharge summaries sent automatically
- **Direct Secure Messaging** (DirectTrust) bridge to reach the national Direct network
- Pharmacy-system and DME-billing integrations
- Open API and bots, Telegram-style (e.g. a prior-auth status bot, or delivery-confirmation bot for DME)
- Multi-location organizations, SSO (SAML/OIDC), SCIM provisioning
- Patient-consented family/caregiver channel (separate, opt-in)
- SOC 2 Type II and HITRUST certification for enterprise sales

---

## 6. Business model (chatting stays free)

| Free forever | Paid "Plus" for organizations | Enterprise (health systems, ACOs) |
|---|---|---|
| Unlimited messages & care-team threads | Inbound fax number / fax-to-chat | EHR integration |
| "Got it" receipts | Attachments over a size limit, longer retention, export | Readmission & communication analytics |
| Fax bridge to reach anyone | Multi-location admin, SSO | Custom BAA, SLA, dedicated support |
| Coworker invites, NPI directory | After-hours routing, on-call schedules | Network-wide rollout and training |

**Rule: never charge the receiving side, and never limit messaging.** Every paywall on messaging slows the network effect.

---

## 7. Legal guardrails (keep it all legal)

- **HIPAA:** Simply Linked acts as a *Business Associate*. Sign a **BAA** with every customer organization (click-through at sign-up) and with every vendor that touches PHI (hosting, fax, email/SMS, backups). See `HIPAA.md`.
- **Faxes (TCPA / Junk Fax Prevention Act):** only send fax notices when a *real message is waiting* for that recipient. Those are transactional notices, not ads. **Never send marketing faxes.** Every notice has an opt-out ✅ built.
- **Minimum necessary:** fax notices, push notifications, emails and SMS **never contain patient information** ✅ built.
- **Referral incentives:** be careful with any reward tied to referrals in healthcare (Anti-Kickback Statute, state laws). Prefer recognition and free features.
- **Substance-use treatment records (42 CFR Part 2)** and some state laws (mental health, HIV, minors) carry extra restrictions. Add a "sensitive" flag and guidance before onboarding such programs.
- **State privacy laws** (e.g. California CMIA, Texas HB 300) and **information-blocking rules** (21st Century Cures Act): review with counsel.
- Have **healthcare counsel** review the BAA, terms, privacy policy and fax practice before launch. *This document is a plan, not legal advice.*
