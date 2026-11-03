# Hush: the clinic front desk that answers itself

**Live:** https://wonshon-cmd.github.io/joseph-wharton/apps/hush/
**Files:** `index.html` (layout), `app.css` (look), `app.js` (all logic), `FLOW.md` (this file)
**Built:** Nov 3, 2026. Static site, no backend, no build step. Data is saved in the browser (`localStorage["hush_v1"]`).

## The problem

- Primary care clinics get about **53 inbound calls per physician per day**. OB/GYN gets about 75 and radiology about 25.
- **Appointment requests are the largest category.** The others are prescription refills, clinical/triage questions, billing and insurance, and referral coordination.
- Calls bunch up on **Monday mornings, in the hour after lunch, and in the last 90 minutes before closing**. That's when callers hit hold queues and give up.

## The idea

Most of these calls are routine tasks that a patient could finish alone if a tool were available 24/7. The calls that do need a person should reach staff **already filled out and sorted by urgency**, and the patient should get a scheduled callback instead of waiting on hold.

## The four screens

| Tab | Who it's for | What it does |
|---|---|---|
| 📱 **Patient** | Patients | A chat assistant in a phone frame. Chips for the 5 call reasons, plus a free-text box that understands requests like "refill my lisinopril" or "how much do I owe". |
| 🗂️ **Front Desk** | Staff | One queue for everything, sorted by urgency, then by time left before each request's target response time. One-click actions. Today's schedule is in the side column. "⚡ Simulate Monday-morning rush" adds 18 requests for demos. |
| 📈 **Insights** | Practice manager | Heatmap of predicted calls by day and hour, Erlang C staffing need (phones only vs. with Hush), annual ROI, and the request mix. |
| ⚙️ **Setup** | Admin | Clinic name, specialty preset (53/75/25), number of physicians, hours, lunch, staff cost, answer-time target, providers. |

## Patient flows

```
Start → identify (demo patient, or name + DOB + phone)
│
├─ 📅 Appointment ── Book new → visit type → provider/soonest → live slot grid → ✅ booked (+ .ics)
│                  ├ Reschedule → pick appt → frees slot → book again (same type and provider)
│                  ├ Cancel → frees slot → next person on the waitlist is offered it
│                  └ No fit → ⏳ waitlist (staff queue item, low urgency)
│
├─ 💊 Refill ── med (from med list or typed) → supply left → pharmacy → side effects?
│              → request to the doctor's sign-off queue (urgent if ≤3 days left)
│              → controlled substance or last visit >12 months → offer a follow-up booking
│
├─ 🩺 Symptoms ── RED-FLAG SCREEN FIRST (chest pain, breathing, stroke signs, bleeding, fainting, self-harm)
│                 ├ any flag → 🚨 "Call 911" card (or 988 for self-harm) + staff follow-up item
│                 └ none → description, duration, severity, fever → urgency (high/med/low)
│                         → same-day slot · video visit · nurse callback (30 min / 2 h / 1 day) · self-care tips
│
├─ 💳 Billing ── balance → pay (demo) / 3-month plan / dispute
│              ├ "Is my insurance accepted?" → instant answer, or sent to billing if unknown
│              └ update insurance → eligibility-check item
│
├─ 🔁 Referral ── status tracker (sent → received → insurance auth → scheduled) + "text me when it moves"
│               └ new referral request → queue
│
└─ 🙋 Person ── topic → pick a callback time (quietest slot marked ⚡) → callback item with a due time
```

**Safety rule:** if typed text matches emergency language at any point ("chest pain", "can't breathe", "kill myself", …), the current flow stops and the 911/988 card appears right away.

## Outcomes Hush records

Every finished flow logs `{type, outcome}`:
- `self`: finished with no staff time (booked, cancelled, paid, status checked, …)
- `routed`: needs a person, but arrives ready (refill sign-off, nurse callback, billing question)
- `emergency`: sent to 911/988

## Front Desk target response times

| Request | Target |
|---|---|
| Triage, high / med / low | 30 min / 2 h / 1 day |
| Refill, high / med / low | 4 h / 1 day / 2 days |
| Billing | 1 day |
| Referral | 2 days |
| Callback | the time the patient picked |

## The staffing model (ties to OIDD 6110)

1. Daily calls = physicians × calls per physician (from the specialty preset).
2. Calls are spread over the week by day weights (Mon 1.32 … Fri 0.8) and hour weights. The opening hours are high (Monday higher still), as are the hour after lunch and the last 2 hours.
3. For each hour, **Erlang C** finds the smallest staff count *N* where P(wait ≤ 60 s) ≥ 80%, using the call length (AHT) from the slider.
4. "With Hush" runs the same model with call volume × (1 − share handled without staff).
5. ROI = annual calls × that share × AHT ÷ 60 × loaded staff cost per hour. 2,000 h = 1 FTE.

## What's real vs. demo

- Open slots come from a deterministic "already booked" pattern plus your real bookings. Slots fill up more the closer the date.
- Patient chart data (Jordan Lee's meds, balance, referral) is made up for the demo.
- Payment is fake, and nothing is sent anywhere.
- Not a medical device. The triage screen sends people toward care; it doesn't diagnose.

## Possible next steps

- Connect to a real EHR/PM system (FHIR `Slot`/`Appointment`, `MedicationRequest`) and an SMS provider.
- Answer phone calls with a voice front end (IVR/voice AI) that uses these same flows, plus text-back for missed calls.
- Optional LLM intent understanding for messy free text, with the regex red-flag screen still running first.
- Specialty-specific flows (OB prenatal scheduling, radiology prep instructions).
