/* =====================================================================
   Hush: the clinic front desk that answers itself.
   Single-file, no backend. Everything is stored in localStorage ("hush_v1").
   Sections: store · helpers · schedule · chat engine · flows · classifier ·
             front desk · insights (Erlang C) · setup · boot
   ===================================================================== */
(function () {
"use strict";

/* ---------------- store ---------------- */
const KEY = "hush_v1";
const SPECIALTIES = {
  primary:   { label: "Primary care",  calls: 53 },
  obgyn:     { label: "OB/GYN",        calls: 75 },
  radiology: { label: "Radiology",     calls: 25 },
  custom:    { label: "Custom",        calls: 40 }
};
const TYPES = {
  appt:     { icon: "📅", label: "Appointments" },
  refill:   { icon: "💊", label: "Refills" },
  triage:   { icon: "🩺", label: "Nurse / triage" },
  billing:  { icon: "💳", label: "Billing & insurance" },
  referral: { icon: "🔁", label: "Referrals" },
  callback: { icon: "📞", label: "Callbacks" }
};
const PCOLORS = ["#5b3df5", "#00b3a4", "#eb6834", "#2a78d6", "#d55181", "#008300"];
const DEMO = {
  name: "Jordan Lee", dob: "03/14/1988", phone: "(215) 555-0142", demo: true,
  meds: ["Lisinopril 10 mg", "Atorvastatin 20 mg", "Sertraline 50 mg"],
  pharmacy: "CVS, 1500 Walnut St", lastVisitMonths: 8, balance: 84.20
};

function defaults() {
  return {
    v: 1,
    settings: { clinic: "Walnut Street Family Medicine", specialty: "primary", callsPerMd: 53, physicians: 4,
      open: 8, close: 17, lunch: 12, wage: 28, aht: 4, deflect: 55, slaSec: 60, slaPct: 80 },
    providers: [
      { id: "p1", name: "Dr. Maya Patel", color: PCOLORS[0] },
      { id: "p2", name: "Dr. Sam Okafor", color: PCOLORS[1] },
      { id: "p3", name: "Riley Chen, NP", color: PCOLORS[2] }
    ],
    appts: [], requests: [], waitlist: [], log: [], seeded: false
  };
}
let S;
try { S = JSON.parse(localStorage.getItem(KEY)); } catch (e) { S = null; }
if (!S || S.v !== 1) S = defaults();
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} };

/* ---------------- helpers ---------------- */
const $ = s => document.querySelector(s);
const esc = s => String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const uid = () => Math.random().toString(36).slice(2, 9);
const sleep = ms => new Promise(r => setTimeout(r, ms));
const pick = a => a[Math.floor(Math.random() * a.length)];
const MIN = 60000;
const fmtTime = d => new Date(d).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
const fmtDay = d => new Date(d).toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
const sameDay = (a, b) => { a = new Date(a); b = new Date(b); return a.toDateString() === b.toDateString(); };
const ago = ts => { const m = Math.round((Date.now() - ts) / MIN); return m < 1 ? "just now" : m < 60 ? m + " min ago" : m < 1440 ? Math.round(m / 60) + " h ago" : Math.round(m / 1440) + " d ago"; };
const money = n => "$" + Math.round(n).toLocaleString();
const prov = id => S.providers.find(p => p.id === id) || { name: "Any provider", color: "#999" };
function hash(str) { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0); }
function toast(t) { const el = $("#toast"); el.textContent = t; el.classList.add("on"); clearTimeout(toast.t); toast.t = setTimeout(() => el.classList.remove("on"), 2600); }
const FIRST = ["Ava", "Liam", "Noah", "Emma", "Mateo", "Zoe", "Ethan", "Priya", "Jamal", "Sofia", "Wei", "Grace", "Omar", "Lucy", "Diego", "Hana", "Marcus", "Nina", "Theo", "Aisha"];
const LAST = ["Nguyen", "Smith", "Garcia", "Kim", "Brown", "Rossi", "Ali", "Cohen", "Johnson", "Silva", "Park", "Davis", "Moreno", "Wright", "Hughes", "Khan"];
const fakeName = seed => FIRST[seed % FIRST.length] + " " + LAST[(seed >>> 5) % LAST.length];

/* ---------------- schedule ---------------- */
const SLOT = 20; // minutes
function businessDays(n) {
  const out = []; const d = new Date(); d.setHours(0, 0, 0, 0);
  while (out.length < n) { if (d.getDay() > 0 && d.getDay() < 6) out.push(new Date(d)); d.setDate(d.getDate() + 1); }
  return out;
}
function daySlots(day) {
  const st = S.settings, out = [];
  for (let m = st.open * 60; m < st.close * 60; m += SLOT) {
    if (m >= st.lunch * 60 && m < (st.lunch + 1) * 60) continue;
    const d = new Date(day); d.setHours(0, m, 0, 0); out.push(d);
  }
  return out;
}
function synthBooked(pid, start) {
  const daysOut = Math.round((new Date(start).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0)) / 864e5);
  const density = daysOut <= 0 ? 84 : daysOut === 1 ? 74 : daysOut < 5 ? 62 : 48;
  return hash(pid + "|" + new Date(start).toISOString()) % 100 < density;
}
function realBooked(pid, start) {
  const t = +new Date(start);
  return S.appts.some(a => a.status === "booked" && a.pid === pid && t >= +new Date(a.start) && t < +new Date(a.start) + a.mins * MIN);
}
const isFree = (pid, start) => !synthBooked(pid, start) && !realBooked(pid, start);
function openSlots({ pid = null, mins = 20, days = 10, limit = 9, skip = 0 }) {
  const need = Math.ceil(mins / SLOT), out = [], now = Date.now() + 30 * MIN;
  const pids = pid ? [pid] : S.providers.map(p => p.id);
  for (const day of businessDays(days)) {
    const slots = daySlots(day);
    for (let i = 0; i < slots.length; i++) {
      if (+slots[i] < now) continue;
      for (const p of pids) {
        let ok = true;
        for (let k = 0; k < need; k++) { const s = slots[i + k]; if (!s || (k && +s - +slots[i + k - 1] !== SLOT * MIN) || !isFree(p, s)) { ok = false; break; } }
        if (ok) { out.push({ start: slots[i], pid: p }); break; }
      }
    }
  }
  return out.slice(skip, skip + limit);
}
function icsLink(a) {
  const f = d => new Date(d).toISOString().replace(/[-:]/g, "").replace(/\.\d+/, "");
  const ics = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Hush//EN", "BEGIN:VEVENT", "UID:" + a.id + "@hush",
    "DTSTAMP:" + f(Date.now()), "DTSTART:" + f(a.start), "DTEND:" + f(+new Date(a.start) + a.mins * MIN),
    "SUMMARY:" + a.type + " with " + prov(a.pid).name, "LOCATION:" + S.settings.clinic, "END:VEVENT", "END:VCALENDAR"].join("\r\n");
  return URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
}

/* ---------------- records ---------------- */
function logEvent(type, outcome, ts) { S.log.push({ ts: ts || Date.now(), type, outcome }); save(); refreshCounts(); }
function addRequest(r) {
  const req = Object.assign({ id: uid(), created: Date.now(), status: "new", urgency: "low", notes: [] }, r);
  S.requests.unshift(req); save(); refreshCounts(); return req;
}
function slaTarget(r) {
  if (r.type === "callback" && r.due) return r.due;
  const m = { triage: { high: 30, med: 120, low: 1440 }, refill: { high: 240, med: 1440, low: 2880 } }[r.type];
  const mins = m ? m[r.urgency] : { billing: 1440, referral: 2880, appt: 1440, callback: 60 }[r.type] || 1440;
  return r.created + mins * MIN;
}

/* ---------------- chat engine ---------------- */
const chat = $("#chat");
let run = 0, pending = null, me = null;
const scroll = () => { chat.scrollTop = chat.scrollHeight; };
function bubble(html, who) { const d = document.createElement("div"); d.className = "msg " + who; d.innerHTML = html; chat.appendChild(d); scroll(); return d; }
function block(el) { chat.appendChild(el); scroll(); return el; }
async function say(html, wait) {
  const my = run;
  const t = bubble("<span></span><span></span><span></span>", "bot typing");
  await sleep(wait != null ? wait : Math.min(900, 260 + html.length * 5));
  t.remove(); if (my !== run) throw new Error("stale");
  return bubble(html, "bot");
}
function card(html, cls) { const d = document.createElement("div"); d.className = "rcard " + (cls || ""); d.innerHTML = html; return block(d); }
function choose(prompt, options, opt = {}) {
  return (prompt ? say(prompt) : Promise.resolve()).then(() => new Promise(resolve => {
    const my = run;
    const wrap = document.createElement("div"); wrap.className = "chips";
    const chosen = new Set();
    const finish = val => {
      if (my !== run) return;
      wrap.classList.add("used"); pending = null;
      const labels = opt.multi ? options.filter(o => val.includes(o.v)).map(o => o.l) : [options.find(o => o.v === val).l];
      bubble(esc(labels.join(", ") || "None of these"), "me");
      resolve(val);
    };
    options.forEach(o => {
      const b = document.createElement("button"); b.type = "button"; b.className = "chip" + (o.primary ? " primary" : ""); b.innerHTML = o.l;
      b.onclick = () => {
        if (!opt.multi) return finish(o.v);
        if (o.v === "__none") return finish([]);
        b.classList.toggle("sel"); chosen.has(o.v) ? chosen.delete(o.v) : chosen.add(o.v);
      };
      wrap.appendChild(b);
    });
    if (opt.multi) { const b = document.createElement("button"); b.type = "button"; b.className = "chip primary"; b.textContent = "Continue →"; b.onclick = () => finish([...chosen]); wrap.appendChild(b); }
    block(wrap);
    pending = { kind: "choose", options, finish, multi: opt.multi };
  }));
}
function ask(prompt, placeholder) {
  return say(prompt).then(() => new Promise(resolve => {
    const my = run;
    $("#msg").placeholder = placeholder || "Type your answer…"; $("#msg").focus();
    pending = { kind: "ask", finish: v => { if (my !== run) return; pending = null; $("#msg").placeholder = "Type what you need…"; bubble(esc(v), "me"); resolve(v); } };
  }));
}
function form(prompt, fields, btn) {
  return say(prompt).then(() => new Promise(resolve => {
    const my = run;
    const f = document.createElement("form"); f.className = "inline-form";
    f.innerHTML = fields.map(x => `<input name="${x.n}" placeholder="${esc(x.p)}" ${x.req === false ? "" : "required"} value="${esc(x.v || "")}">`).join("") + `<button>${esc(btn || "Continue")}</button>`;
    f.onsubmit = e => {
      e.preventDefault(); if (my !== run) return;
      const out = {}; fields.forEach(x => out[x.n] = f.elements[x.n].value.trim());
      f.querySelectorAll("input,button").forEach(i => i.disabled = true); f.style.opacity = .55;
      bubble(esc(fields.filter(x => !x.secret).map(x => out[x.n]).filter(Boolean).join(" · ")), "me"); resolve(out);
    };
    block(f); f.elements[0].focus();
  }));
}
function slotPicker(slots, extra) {
  return new Promise(resolve => {
    const my = run;
    const g = document.createElement("div"); g.className = "slotgrid"; let lastDay = "";
    slots.forEach(s => {
      const day = fmtDay(s.start);
      if (day !== lastDay) { const h = document.createElement("div"); h.className = "slotday"; h.textContent = sameDay(s.start, Date.now()) ? "Today · " + day : day; g.appendChild(h); lastDay = day; }
      const b = document.createElement("button"); b.type = "button"; b.className = "slot";
      b.innerHTML = `${fmtTime(s.start)}<small>${esc(prov(s.pid).name.replace(/^Dr\. /, "Dr. ").split(",")[0])}</small>`;
      b.onclick = () => { if (my !== run) return; g.style.pointerEvents = "none"; g.style.opacity = .5; ex.classList.add("used"); bubble(esc(fmtDay(s.start) + " at " + fmtTime(s.start)), "me"); resolve(s); };
      g.appendChild(b);
    });
    block(g);
    const ex = document.createElement("div"); ex.className = "chips";
    extra.forEach(o => { const b = document.createElement("button"); b.type = "button"; b.className = "chip"; b.textContent = o.l; b.onclick = () => { if (my !== run) return; g.style.pointerEvents = "none"; g.style.opacity = .5; ex.classList.add("used"); bubble(esc(o.l), "me"); resolve(o.v); }; ex.appendChild(b); });
    block(ex);
  });
}

/* ---------------- flows ---------------- */
const MAIN = [
  { v: "appt", l: "📅 Appointment" }, { v: "refill", l: "💊 Prescription refill" },
  { v: "triage", l: "🩺 Symptoms / ask a nurse" }, { v: "billing", l: "💳 Billing & insurance" },
  { v: "referral", l: "🔁 Referral status" }, { v: "callback", l: "🙋 Talk to a person" }
];
async function start(intent, firstText) {
  run++; pending = null; chat.innerHTML = "";
  try {
    if (!intent) {
      await say(`Hi! 👋 I'm <b>Hush</b>, the virtual front desk for <b>${esc(S.settings.clinic)}</b>. I can book visits, request refills, check bills and referrals, or get a nurse to call you back.`, 500);
      intent = await choose("What can I help with today?", MAIN);
    }
    await route(intent, firstText);
  } catch (e) { if (e.message !== "stale") console.error(e); }
}
async function route(intent, text) {
  const F = { appt: flowAppt, refill: flowRefill, triage: flowTriage, billing: flowBilling, referral: flowReferral, callback: flowHuman, emergency: flowEmergencyDirect };
  await F[intent](text);
  const more = await choose("Anything else I can help with?", [{ v: "y", l: "Yes, something else" }, { v: "n", l: "No, I'm all set" }]);
  if (more === "y") { const i = await choose(null, MAIN); return route(i); }
  await say("You're all set. Have a good day! 💜 You can come back any time, 24/7. No hold music.");
}
async function identify() {
  if (me) return me;
  const w = await choose("First, who am I helping today?", [{ v: "demo", l: `I'm ${DEMO.name} (demo patient)` }, { v: "new", l: "Someone else" }]);
  if (w === "demo") { me = DEMO; await say(`Thanks, ${DEMO.name.split(" ")[0]}. Identity confirmed with your date of birth on file ✅`); return me; }
  const f = await form("Please enter your details. We use them to find your chart.", [{ n: "name", p: "Full name" }, { n: "dob", p: "Date of birth (MM/DD/YYYY)" }, { n: "phone", p: "Mobile number" }], "Verify me");
  me = { name: f.name, dob: f.dob, phone: f.phone, meds: [], pharmacy: "", lastVisitMonths: 6, balance: 0 };
  await say(`Thanks, ${esc(f.name.split(" ")[0])} ✅`); return me;
}

const VISITS = [
  { v: "Sick visit", l: "🤒 Sick visit", mins: 20 }, { v: "Follow-up", l: "🔄 Follow-up", mins: 20 },
  { v: "Annual physical", l: "🩻 Annual physical", mins: 40 }, { v: "Telehealth", l: "💻 Video visit", mins: 20 },
  { v: "New patient", l: "✨ New patient", mins: 40 }
];
async function flowAppt(text) {
  const p = await identify();
  let act = /cancel/i.test(text || "") ? "cancel" : /resched|move|change/i.test(text || "") ? "resched" : null;
  if (!act) act = await choose("Do you want to book a new appointment or change one you have?", [{ v: "new", l: "Book new" }, { v: "resched", l: "Reschedule" }, { v: "cancel", l: "Cancel" }]);
  if (act === "new") return book(p);
  const mine = S.appts.filter(a => a.status === "booked" && a.patient === p.name && +new Date(a.start) > Date.now()).sort((a, b) => new Date(a.start) - new Date(b.start));
  if (!mine.length) { await say("I don't see any upcoming appointments for you. Want to book one?"); const y = await choose(null, [{ v: "y", l: "Yes, book one" }, { v: "n", l: "No thanks" }]); if (y === "y") return book(p); return; }
  const id = await choose("Which appointment?", mine.map(a => ({ v: a.id, l: `${fmtDay(a.start)} ${fmtTime(a.start)} · ${esc(a.type)}` })));
  const a = S.appts.find(x => x.id === id);
  a.status = "cancelled"; save();
  const wl = S.waitlist.shift(); if (wl) save();
  if (act === "cancel") {
    card(`<h4>❌ Cancelled</h4>${fmtDay(a.start)} at ${fmtTime(a.start)} with ${esc(prov(a.pid).name)}.${wl ? `<p class="note">Your slot was offered right away to the next patient on the waitlist, so it won't go empty.</p>` : ""}`, "ok");
    logEvent("appt", "self");
    renderDesk();
    return;
  }
  await say(`Okay, let's find a new time for your <b>${esc(a.type)}</b>.`);
  return book(p, VISITS.find(v => v.v === a.type) || VISITS[1], a.pid);
}
async function book(p, visit, pid, reason) {
  if (!visit) { const v = await choose("What kind of visit?", VISITS); visit = VISITS.find(x => x.v === v); }
  if (pid === undefined) {
    const pv = await choose("Who would you like to see?", [{ v: "any", l: "⚡ Soonest available" }].concat(S.providers.map(x => ({ v: x.id, l: esc(x.name) }))));
    pid = pv === "any" ? null : pv;
  }
  let skip = 0;
  for (;;) {
    const slots = openSlots({ pid, mins: visit.mins, skip, limit: 9 });
    if (!slots.length) { await say("No openings in the next two weeks. I'll put you on the waitlist and text you as soon as one opens."); return waitlist(p, visit, pid); }
    await say(skip ? "Here are later times:" : `Here are the next open times for a <b>${esc(visit.v.toLowerCase())}</b>. Tap one to book:`);
    const s = await slotPicker(slots, [{ v: "more", l: "Later times →" }, { v: "wait", l: "⏳ Waitlist me for something sooner" }]);
    if (s === "more") { skip += 9; continue; }
    if (s === "wait") return waitlist(p, visit, pid);
    const appt = { id: uid(), pid: s.pid, start: s.start.toISOString(), mins: visit.mins, type: visit.v, patient: p.name, phone: p.phone, reason: reason || "", status: "booked", created: Date.now(), source: "hush" };
    S.appts.push(appt); save(); logEvent("appt", "self"); renderDesk();
    card(`<h4>✅ You're booked</h4><div class="big">${fmtTime(s.start)}</div>${fmtDay(s.start)} · ${esc(visit.v)} with <b>${esc(prov(s.pid).name)}</b><br><span class="note">${visit.v === "Telehealth" ? "We'll text you a video link 10 minutes before." : "Please arrive 10 minutes early with your insurance card."} You'll get a reminder text 24 h before; reply C to cancel.</span>
      <div class="chips" style="margin-top:8px"><a class="chip" href="${icsLink(appt)}" download="appointment.ics">📆 Add to calendar</a></div>`, "ok");
    return appt;
  }
}
async function waitlist(p, visit, pid) {
  S.waitlist.push({ patient: p.name, type: visit.v, pid, created: Date.now() });
  addRequest({ type: "appt", patient: p.name, phone: p.phone, urgency: "low", title: "Waitlist: " + visit.v, body: `Wants an earlier ${visit.v.toLowerCase()}${pid ? " with " + prov(pid).name : ""}. Auto-offer when a slot opens.` });
  logEvent("appt", "self");
  card(`<h4>⏳ You're on the waitlist</h4>When an earlier ${esc(visit.v.toLowerCase())} opens up, we'll text ${esc(p.phone || "you")}. Reply YES to claim it.`, "ok");
}

const CONTROLLED = /oxycodone|hydrocodone|percocet|vicodin|adderall|vyvanse|ritalin|methylphenidate|alprazolam|xanax|lorazepam|ativan|clonazepam|klonopin|diazepam|valium|tramadol|zolpidem|ambien|suboxone|buprenorphine|codeine|morphine|testosterone/i;
async function flowRefill(text) {
  const p = await identify();
  let med = null;
  const known = (p.meds || []).find(m => text && text.toLowerCase().includes(m.split(" ")[0].toLowerCase()));
  if (known) { med = known; await say(`Got it: <b>${esc(med)}</b>.`); }
  else {
    const opts = (p.meds || []).map(m => ({ v: m, l: esc(m) })).concat([{ v: "__other", l: "Another medication" }]);
    med = p.meds && p.meds.length ? await choose("Which medication needs a refill? These are on your list:", opts) : "__other";
    if (med === "__other") med = await ask("What's the name and dose of the medication?", "e.g. Metformin 500 mg");
  }
  const left = await choose("How much do you have left?", [{ v: "0", l: "None, I'm out" }, { v: "3", l: "1–3 days" }, { v: "7", l: "4–7 days" }, { v: "14", l: "More than a week" }]);
  let pharmacy = p.pharmacy;
  if (pharmacy) { const pc = await choose(`Send it to <b>${esc(pharmacy)}</b>?`, [{ v: "y", l: "Yes, same pharmacy" }, { v: "n", l: "Different pharmacy" }]); if (pc === "n") pharmacy = null; }
  if (!pharmacy) pharmacy = await ask("Which pharmacy (name and street)?", "e.g. Walgreens, 3 S 40th St");
  const se = await choose("Any new side effects or problems with this medicine?", [{ v: "n", l: "No" }, { v: "y", l: "Yes" }]);
  let seText = ""; if (se === "y") seText = await ask("Briefly, what's going on?", "e.g. dizzy when standing");
  const controlled = CONTROLLED.test(med);
  const overdue = (p.lastVisitMonths || 0) > 12;
  const urgency = left === "0" || left === "3" ? "high" : left === "7" ? "med" : "low";
  const doc = S.providers[0];
  addRequest({ type: "refill", patient: p.name, phone: p.phone, urgency, title: "Refill: " + med,
    body: `Pharmacy: ${pharmacy} · Supply left: ${{ 0: "none", 3: "1–3 days", 7: "4–7 days", 14: "> 1 week" }[left]} · Side effects: ${se === "y" ? seText : "none"}${controlled ? " · ⚠ Controlled substance: needs provider review" : ""} · Last visit ${p.lastVisitMonths || "?"} mo ago`, med, pharmacy });
  logEvent("refill", "routed");
  card(`<h4>💊 Refill request sent</h4><b>${esc(med)}</b> → ${esc(pharmacy)}<br>It's in ${esc(doc.name)}'s sign-off queue${urgency === "high" ? ", flagged <b>priority</b> because you're almost out" : ""}. Typical turnaround: <b>${urgency === "high" ? "same day" : "1 business day"}</b>. We'll text you when it's at the pharmacy.
    ${controlled ? `<p class="note">⚠ This is a controlled medication, so the provider has to review it personally and may need a visit first.</p>` : ""}`, "ok");
  if (se === "y") await say("Because you mentioned side effects, a nurse will look at your note too.");
  if (overdue || controlled) {
    const b = await choose("Most refills need a check-in at least once a year. Want to book one now?", [{ v: "y", l: "Book a follow-up" }, { v: "n", l: "Not now" }]);
    if (b === "y") return book(p, VISITS[1]);
  }
}

const REDFLAGS = [
  { v: "chest", l: "Chest pain or pressure" }, { v: "breath", l: "Trouble breathing" },
  { v: "stroke", l: "Face drooping, slurred speech, or weakness on one side" }, { v: "bleed", l: "Heavy bleeding that won't stop" },
  { v: "faint", l: "Fainted or confused" }, { v: "harm", l: "Thoughts of hurting yourself" }, { v: "__none", l: "None of these" }
];
async function emergency(flags, p) {
  if (flags.includes("harm") && flags.length === 1) {
    card(`<h4>💜 You're not alone. Help is available right now.</h4>Call or text <b>988</b> (Suicide & Crisis Lifeline), free and 24/7.<br>If you are in immediate danger, call <b>911</b>.<div class="chips" style="margin-top:8px"><a class="chip primary" href="tel:988">Call 988</a><a class="chip" href="sms:988">Text 988</a></div>`, "alert");
  } else {
    card(`<h4>🚨 Please call 911 now</h4>What you described can be a medical emergency. <b>Don't wait for a callback</b> and don't drive yourself.<div class="chips" style="margin-top:8px"><a class="chip primary" href="tel:911">Call 911</a></div>`, "alert");
  }
  addRequest({ type: "triage", patient: p ? p.name : "Unknown patient", phone: p ? p.phone : "", urgency: "high", title: "Red flag: sent to 911/988",
    body: "Red flags reported: " + flags.map(f => (REDFLAGS.find(r => r.v === f) || { l: f }).l).join(", ") + ". Nurse to follow up after the ED visit." });
  logEvent("triage", "emergency");
}
async function flowEmergencyDirect(text) {
  const flags = /suicid|kill myself|hurt myself|end my life/i.test(text) ? ["harm"] : ["chest"];
  await emergency(flags, me);
}
async function flowTriage() {
  await say("I'll ask a few quick questions so the right person sees this. <i>I can't diagnose anything, but I can get you to the right care fast.</i>");
  const flags = await choose("Do you have <b>any</b> of these <b>right now</b>?", REDFLAGS, { multi: true });
  if (flags.length) return emergency(flags, me);
  const p = await identify();
  const what = await ask("In a sentence or two, what's going on?", "e.g. sore throat and fever since Sunday");
  const dur = await choose("How long has this been going on?", [{ v: 0, l: "Started today" }, { v: 2, l: "1–3 days" }, { v: 5, l: "4–7 days" }, { v: 10, l: "More than a week" }]);
  const sev = await choose("How bad is it, from 1 to 10?", [{ v: 2, l: "1–3 mild" }, { v: 5, l: "4–6 moderate" }, { v: 8, l: "7–10 severe" }]);
  const fever = await choose("Any fever (100.4°F / 38°C or higher)?", [{ v: "y", l: "Yes" }, { v: "n", l: "No" }, { v: "?", l: "Not sure" }]);
  const urgency = sev >= 7 || (fever === "y" && dur >= 5) ? "high" : sev >= 4 || fever === "y" ? "med" : "low";
  const body = `"${what}" · ${{ 0: "today", 2: "1–3 days", 5: "4–7 days", 10: "> 1 week" }[dur]} · severity ${sev === 8 ? "7–10" : sev === 5 ? "4–6" : "1–3"} · fever: ${fever}`;
  const nurseWait = urgency === "high" ? "30 minutes" : urgency === "med" ? "2 hours" : "1 business day";
  const label = { high: "🔴 Needs attention today", med: "🟠 Should be seen soon", low: "🟢 Can likely wait for a routine visit" }[urgency];
  await say(`Thanks. Based on your answers: <b>${label}</b>.`);
  const opts = [];
  const sd = openSlots({ mins: 20, days: 2, limit: 1 })[0];
  if (urgency !== "low" && sd) opts.push({ v: "book", l: `📅 ${sameDay(sd.start, Date.now()) ? "Today" : "Tomorrow"} ${fmtTime(sd.start)} with ${esc(prov(sd.pid).name)}`, primary: true });
  opts.push({ v: "tele", l: "💻 Video visit" }, { v: "nurse", l: `📞 Nurse calls me (within ${nurseWait})` });
  if (urgency === "low") opts.push({ v: "tips", l: "🏠 Self-care tips for now" });
  const c = await choose("What would you like to do?", opts);
  if (c === "book") {
    const appt = { id: uid(), pid: sd.pid, start: sd.start.toISOString(), mins: 20, type: "Sick visit", patient: p.name, phone: p.phone, reason: body, status: "booked", created: Date.now(), source: "hush" };
    S.appts.push(appt); save(); logEvent("triage", "self"); renderDesk();
    card(`<h4>✅ Booked: sick visit</h4><div class="big">${fmtTime(sd.start)}</div>${fmtDay(sd.start)} with ${esc(prov(sd.pid).name)}. Your answers are already in your chart, so you won't have to repeat them.<p class="note">If it gets worse before then (trouble breathing, chest pain, confusion), call 911.</p>`, "ok");
  } else if (c === "tele") {
    await book(p, VISITS[3], null, body);
  } else if (c === "nurse") {
    addRequest({ type: "triage", patient: p.name, phone: p.phone, urgency, title: "Nurse callback: symptoms", body });
    logEvent("triage", "routed");
    card(`<h4>📞 A nurse will call you within ${nurseWait}</h4>At ${esc(p.phone || "your number on file")}. Keep your phone nearby. No need to stay on hold.<p class="note">If it gets worse before then, call 911.</p>`, "ok");
  } else {
    logEvent("triage", "self");
    card(`<h4>🏠 For now</h4><ul style="margin:4px 0 0;padding-left:18px"><li>Rest, drink plenty of fluids</li><li>Over-the-counter pain/fever medicine as the label directs</li><li>Book a routine visit if it isn't better in a few days</li><li><b>Call 911</b> if you have trouble breathing, chest pain, or confusion</li></ul>`, "ok");
  }
}

const INSURERS = ["Aetna", "Blue Cross", "Independence Blue Cross", "Cigna", "UnitedHealthcare", "Humana", "Medicare", "Medicaid", "Keystone First", "AmeriHealth", "Highmark", "Kaiser"];
async function flowBilling(text) {
  const p = await identify();
  const c = /insur|accept|coverage|network/i.test(text || "") ? "acc" : await choose("What do you need help with?", [{ v: "bal", l: "💵 See / pay my balance" }, { v: "acc", l: "🛡️ Is my insurance accepted?" }, { v: "upd", l: "🪪 Update my insurance" }, { v: "q", l: "❓ Question for billing" }]);
  if (c === "bal") {
    const bal = p.balance || 0;
    if (!bal) { card(`<h4>💵 Balance: $0.00</h4>You're all paid up. 🎉`, "ok"); return logEvent("billing", "self"); }
    card(`<h4>💵 Balance due</h4><div class="big">$${bal.toFixed(2)}</div><table class="t"><tr><td>Office visit copay · Sep 18</td><td>$40.00</td></tr><tr><td>Lab: lipid panel (after insurance) · Sep 18</td><td>$44.20</td></tr></table>`);
    const a = await choose(null, [{ v: "pay", l: "Pay now", primary: true }, { v: "plan", l: "3-month payment plan" }, { v: "q", l: "Something looks wrong" }]);
    if (a === "pay") {
      await form("Card details (demo only, nothing is charged):", [{ n: "card", p: "Card number", secret: true }, { n: "exp", p: "MM/YY", secret: true }], `Pay $${bal.toFixed(2)}`);
      p.balance = 0; logEvent("billing", "self");
      card(`<h4>✅ Paid $${bal.toFixed(2)}</h4>Receipt texted to ${esc(p.phone)}. Thank you!`, "ok");
    } else if (a === "plan") {
      logEvent("billing", "self");
      card(`<h4>✅ Payment plan set</h4>3 payments of <b>$${(bal / 3).toFixed(2)}</b>, on the 1st of each month. No interest.`, "ok");
    } else { const q = await ask("What looks wrong?", "e.g. I was charged twice"); billingReq(p, "Disputed charge", q); }
  } else if (c === "acc") {
    const ins = await ask("Which insurance plan do you have?", "e.g. Aetna PPO");
    const hit = INSURERS.find(i => ins.toLowerCase().includes(i.toLowerCase().split(" ")[0].toLowerCase()));
    if (hit) { card(`<h4>✅ Yes, we accept ${esc(hit)}</h4>Most ${esc(hit)} plans are in-network here. Your copay depends on your plan; it's printed on your card.`, "ok"); logEvent("billing", "self"); }
    else { await say("I'm not sure about that plan, so I've asked the billing team to check and text you back within 1 business day."); billingReq(p, "Check network status", ins); }
  } else if (c === "upd") {
    const f = await form("Enter your new insurance:", [{ n: "ins", p: "Insurance company" }, { n: "mid", p: "Member ID" }, { n: "grp", p: "Group # (optional)", req: false }], "Save insurance");
    addRequest({ type: "billing", patient: p.name, phone: p.phone, urgency: "low", title: "Verify new insurance", body: `${f.ins} · Member ${f.mid}${f.grp ? " · Group " + f.grp : ""} (auto eligibility check queued)` });
    logEvent("billing", "self");
    card(`<h4>✅ Insurance updated</h4>We'll check eligibility before your next visit. Bring the physical card to your next appointment too.`, "ok");
  } else { const q = await ask("What's your question?", "Type your billing question"); billingReq(p, "Billing question", q); }
}
function billingReq(p, title, body) {
  addRequest({ type: "billing", patient: p.name, phone: p.phone, urgency: "low", title, body });
  logEvent("billing", "routed");
  card(`<h4>📨 Sent to the billing team</h4>You'll get a text reply within 1 business day.`, "ok");
}

async function flowReferral() {
  const p = await identify();
  if (p.demo) {
    card(`<h4>🔁 Cardiology referral · Penn Heart & Vascular</h4><ul class="steps">
      <li class="done">Referral sent by ${esc(S.providers[0].name)}: Oct 27</li>
      <li class="done">Received by the specialist's office: Oct 28</li>
      <li class="now">Insurance authorization: submitted Oct 30 (usually 3–5 business days)</li>
      <li>Specialist calls you to schedule</li></ul>`);
    const a = await choose("What would you like to do?", [{ v: "notify", l: "🔔 Text me when it moves" }, { v: "new", l: "I need a different referral" }, { v: "ok", l: "That's all I needed" }]);
    if (a === "notify") { logEvent("referral", "self"); card("🔔 Done. You'll get a text at each step.", "ok"); return; }
    if (a === "ok") { logEvent("referral", "self"); return; }
  } else await say("I don't see any open referrals on your chart.");
  const sp = await choose("Which kind of specialist?", ["Cardiology", "Dermatology", "Orthopedics", "GI", "Physical therapy", "Behavioral health", "Other"].map(x => ({ v: x, l: x })));
  const why = await ask("What's the reason for the referral?", "e.g. knee pain after running");
  const insReq = await choose("Does your insurance need a referral for specialists (HMO)?", [{ v: "y", l: "Yes / HMO" }, { v: "n", l: "No / PPO" }, { v: "?", l: "Not sure" }]);
  addRequest({ type: "referral", patient: p.name, phone: p.phone, urgency: "low", title: "New referral: " + sp, body: `${why} · Insurance needs referral: ${insReq}` });
  logEvent("referral", "routed");
  card(`<h4>📨 Referral request sent</h4>Your provider will review it within 2 business days. Then you can track it right here, step by step, without calling.`, "ok");
}

function callbackWindows() {
  const st = S.settings, out = []; const now = new Date();
  let t = new Date(now); t.setMinutes(t.getMinutes() < 30 ? 30 : 60, 0, 0);
  let guard = 0;
  while (out.length < 6 && guard++ < 200) {
    const h = t.getHours() + t.getMinutes() / 60, wd = t.getDay();
    if (wd > 0 && wd < 6 && h >= st.open && h < st.close && !(h >= st.lunch && h < st.lunch + 1)) out.push({ t: new Date(t), load: hourWeight(wd, t.getHours()) });
    t = new Date(+t + 30 * MIN);
  }
  const minLoad = Math.min(...out.map(o => o.load));
  return out.map(o => ({ ...o, quiet: o.load === minLoad }));
}
async function flowHuman() {
  const p = await identify();
  const about = await choose("Happy to get you to a person. What's it about? (So the right person calls.)", [{ v: "Scheduling", l: "Scheduling" }, { v: "Medical question", l: "Medical question" }, { v: "Billing", l: "Billing" }, { v: "Records / forms", l: "Records / forms" }, { v: "Something else", l: "Something else" }]);
  const w = callbackWindows();
  const t = await choose("Instead of waiting on hold, pick a time for us to call you:", w.map(o => ({ v: +o.t, l: `${sameDay(o.t, Date.now()) ? "" : fmtDay(o.t) + " "}${fmtTime(o.t)}${o.quiet ? " ⚡ quietest" : ""}` })));
  const note = await ask("Anything we should know before we call? (or type “no”)", "Optional note");
  addRequest({ type: "callback", patient: p.name, phone: p.phone, urgency: about === "Medical question" ? "med" : "low", title: "Callback: " + about, body: (/^no\.?$/i.test(note) ? "" : note + " · ") + "Scheduled for " + fmtDay(t) + " " + fmtTime(t), due: t });
  logEvent("callback", "routed");
  card(`<h4>📞 Callback booked</h4><div class="big">${fmtTime(t)}</div>${fmtDay(t)} · we'll call ${esc(p.phone || "you")}. You keep your place without holding.`, "ok");
}

/* ---------------- classifier (free text → intent) ---------------- */
const KW = {
  emergency: /chest pain|can'?t breathe|cannot breathe|not breathing|stroke|suicid|kill myself|hurt myself|end my life|overdos|unconscious/i,
  appt: /appoint|book|schedul|resched|cancel|visit|checkup|check-up|physical|slot|availab|see (the|a|my) (doctor|dr|provider)|opening/i,
  refill: /refill|prescri|\brx\b|medic|meds\b|pharmac|pill|renew|lisinopril|atorvastatin|sertraline|metformin|inhaler|ran out/i,
  triage: /pain|fever|sick|cough|hurt|symptom|rash|vomit|nause|dizz|bleed|breath|nurse|headache|sore|infect|swell|ill\b|flu|covid|cold\b|ache/i,
  billing: /bill|pay|balance|insur|copay|charge|invoice|cost|deductible|statement|owe/i,
  referral: /referr|refer\b|specialist|cardiolog|dermatolog|orthop|authoriz/i,
  callback: /human|person|someone|representative|operator|reception|call me|agent|talk to|speak/i
};
function classify(t) { for (const k of ["emergency", "refill", "billing", "referral", "triage", "appt", "callback"]) if (KW[k].test(t)) return k; return null; }

$("#composer").addEventListener("submit", e => {
  e.preventDefault();
  const v = $("#msg").value.trim(); if (!v) return; $("#msg").value = "";
  if (KW.emergency.test(v)) { chat.querySelectorAll(".chips,.slotgrid").forEach(c => c.classList.add("used")); bubble(esc(v), "me"); ++run; pending = null; (async () => { try { await flowEmergencyDirect(v); } catch (er) {} })(); return; }
  if (pending && pending.kind === "ask") return pending.finish(v);
  if (pending && pending.kind === "choose" && !pending.multi) {
    const o = pending.options.find(o => o.l.replace(/<[^>]+>/g, "").toLowerCase().includes(v.toLowerCase()));
    if (o) return pending.finish(o.v);
  }
  const intent = classify(v);
  if (!intent) { bubble(esc(v), "me"); say("Sorry, I didn't quite get that. Tap one of the options, or try “book a visit”, “refill”, “billing”, or “talk to a person”.").catch(() => {}); return; }
  (async () => { await start(intent, v); })();
  // re-show what they typed at the top of the fresh conversation
  setTimeout(() => { const d = document.createElement("div"); d.className = "msg me"; d.textContent = v; chat.prepend(d); }, 0);
});
$("#restart").onclick = () => { me = null; start(); };

/* ---------------- front desk ---------------- */
let filter = "open";
function refreshCounts() {
  const n = S.requests.filter(r => r.status !== "done").length;
  const b = $("#deskBadge"); b.textContent = n; b.dataset.n = n;
}
function slaBadge(r) {
  if (r.status === "done") return `<span class="sla fin">✓ done</span>`;
  const due = slaTarget(r), left = due - Date.now();
  if (r.type === "callback" && left > 60 * MIN) return `<span class="sla ok">call at ${fmtTime(due)}</span>`;
  const m = Math.round(Math.abs(left) / MIN), txt = m < 60 ? m + " min" : m < 1440 ? Math.round(m / 60) + " h" : Math.round(m / 1440) + " d";
  if (left < 0) return `<span class="sla late">⏱ ${txt} overdue</span>`;
  return `<span class="sla ${left < 30 * MIN ? "warn" : "ok"}">⏱ ${txt} left</span>`;
}
const ACTIONS = {
  refill: [["approve", "✅ Approve → pharmacy", "ok"], ["visit", "📅 Needs a visit", "ghost"]],
  triage: [["call", "📞 Calling now", "ghost"], ["book", "📅 Book same-day", "ghost"], ["done", "✓ Resolved", "ok"]],
  callback: [["call", "📞 Calling now", "ghost"], ["done", "✓ Done", "ok"]],
  billing: [["start", "Working on it", "ghost"], ["done", "✓ Replied", "ok"]],
  referral: [["start", "Working on it", "ghost"], ["done", "✓ Sent", "ok"]],
  appt: [["done", "✓ Offered slot", "ok"]]
};
function act(id, a) {
  const r = S.requests.find(x => x.id === id); if (!r) return;
  const msgs = { approve: "Refill approved and sent to " + (r.pharmacy || "pharmacy") + "; patient texted.", visit: "Patient texted a link to book a visit before refilling.", call: "Call in progress.", start: "In progress.", done: "Completed; patient notified.", book: "Same-day slot texted to patient." };
  r.notes.push({ ts: Date.now(), t: msgs[a] });
  r.status = (a === "call" || a === "start") ? "progress" : "done";
  if (r.status === "done") r.closed = Date.now();
  save(); renderDesk(); toast(msgs[a]);
}
function renderDesk() {
  refreshCounts();
  const open = S.requests.filter(r => r.status !== "done");
  const todayLog = S.log.filter(l => sameDay(l.ts, Date.now()));
  const self = todayLog.filter(l => l.outcome === "self").length;
  const urgent = open.filter(r => r.urgency === "high").length;
  const late = open.filter(r => slaTarget(r) < Date.now()).length;
  const booked = S.appts.filter(a => a.source === "hush" && sameDay(a.created, Date.now()) && a.status === "booked").length;
  $("#deskKpis").innerHTML = [
    [open.length, "Open requests"], [urgent, "🔴 Urgent"], [late, "⏱ Past target time"],
    [self, "Finished without staff today"], [booked, "Visits booked by Hush today"],
    [Math.round((self * S.settings.aht + todayLog.filter(l => l.outcome === "routed").length * (S.settings.aht - 1)) ) + " min", "Phone time saved today", true]
  ].map(k => `<div class="kpi${k[2] ? " hl" : ""}"><div class="v">${k[0]}</div><div class="l">${k[1]}</div></div>`).join("");

  const cnt = t => open.filter(r => r.type === t).length;
  $("#filters").innerHTML = [["open", "📥 All open", open.length]].concat(Object.keys(TYPES).map(t => [t, TYPES[t].icon + " " + TYPES[t].label, cnt(t)]), [["done", "✓ Completed", S.requests.length - open.length]])
    .map(f => `<button data-f="${f[0]}" class="${filter === f[0] ? "on" : ""}">${f[1]}<span>${f[2]}</span></button>`).join("");

  const U = { high: 0, med: 1, low: 2 };
  let list = filter === "open" ? open : filter === "done" ? S.requests.filter(r => r.status === "done") : open.filter(r => r.type === filter);
  list = list.slice().sort((a, b) => filter === "done" ? b.closed - a.closed : (U[a.urgency] - U[b.urgency]) || (slaTarget(a) - slaTarget(b)));
  $("#queue").innerHTML = list.length ? list.map(r => `<div class="req u-${r.urgency}${r.status === "done" ? " done" : ""}">
      <div><div class="t">${TYPES[r.type].icon} ${esc(r.title)}</div><div class="meta"><span class="tag">${r.urgency === "high" ? "urgent" : r.urgency === "med" ? "soon" : "routine"}</span>${esc(r.patient)}${r.phone ? " · " + esc(r.phone) : ""} · ${ago(r.created)}${r.status === "progress" ? " · <b>in progress</b>" : ""}</div></div>
      ${slaBadge(r)}
      <div class="body">${esc(r.body)}${r.notes.length ? `<div class="note">${r.notes.map(n => "• " + fmtTime(n.ts) + " " + esc(n.t)).join("<br>")}</div>` : ""}</div>
      ${r.status !== "done" ? `<div class="acts">${(ACTIONS[r.type] || []).map(a => `<button class="btn sm ${a[2]}" data-id="${r.id}" data-a="${a[0]}">${a[1]}</button>`).join("")}</div>` : ""}
    </div>`).join("") : `<div class="empty">${filter === "done" ? "Nothing completed yet." : "🎉 Queue is clear. Try the patient app, or press ⚡ Simulate rush."}</div>`;

  // today's schedule: real + synthetic booked slots
  const today = businessDays(1)[0];
  const rows = [];
  daySlots(today).forEach(s => S.providers.forEach(p => {
    const real = S.appts.find(a => a.status === "booked" && a.pid === p.id && +new Date(a.start) === +s);
    if (real) rows.push({ t: s, p, who: real.patient, type: real.type, isNew: real.source === "hush" });
    else if (synthBooked(p.id, s) && !realBooked(p.id, s) && hash(p.id + s) % 3 !== 0) rows.push({ t: s, p, who: fakeName(hash("n" + p.id + s)), type: pick2(["Follow-up", "Sick visit", "Annual physical", "Telehealth"], hash("t" + p.id + s)) });
  }));
  $("#todayList").innerHTML = `<p class="note" style="margin:-6px 0 8px">${fmtDay(today)} · ${rows.length} visits · <span style="color:var(--brand)">■</span> booked by Hush</p>` +
    rows.map(r => `<div class="appt${r.isNew ? " new" : ""}"><b>${fmtTime(r.t)}</b><div><span style="color:${r.p.color}">●</span> ${esc(r.who)}<div class="who">${esc(r.type)} · ${esc(r.p.name)}</div></div></div>`).join("");
}
const pick2 = (a, h) => a[h % a.length];
$("#filters").addEventListener("click", e => { const b = e.target.closest("button"); if (b) { filter = b.dataset.f; renderDesk(); } });
$("#queue").addEventListener("click", e => { const b = e.target.closest("button[data-a]"); if (b) act(b.dataset.id, b.dataset.a); });
$("#clearDone").onclick = () => { S.requests = S.requests.filter(r => r.status !== "done"); save(); renderDesk(); toast("Completed requests cleared"); };
$("#simRush").onclick = () => { simulate(18, 45); renderDesk(); toast("18 patient requests just came in. Hush already sorted them."); };

const SIM = {
  refill: [["Refill: Metformin 500 mg", "Pharmacy: Rite Aid, Lancaster Ave · Supply left: 1–3 days · Side effects: none"], ["Refill: Albuterol inhaler", "Pharmacy: CVS, Walnut St · Supply left: none · Side effects: none"], ["Refill: Levothyroxine 50 mcg", "Pharmacy: Walgreens · Supply left: 4–7 days · Side effects: none"]],
  triage: [["Nurse callback: symptoms", "\"Sore throat and fever since Saturday\" · 1–3 days · severity 4–6 · fever: y"], ["Nurse callback: symptoms", "\"Ankle swollen after a fall\" · today · severity 4–6 · fever: n"], ["Nurse callback: symptoms", "\"Rash on arms, itchy\" · 4–7 days · severity 1–3 · fever: n"]],
  billing: [["Billing question", "Why was I charged for the lab when my plan covers it?"], ["Check network status", "Oscar Health EPO"], ["Disputed charge", "I think I was billed twice for Oct 2"]],
  referral: [["New referral: Dermatology", "Mole that changed shape · Insurance needs referral: y"], ["New referral: Physical therapy", "Low back pain 6 weeks · Insurance needs referral: ?"]],
  callback: [["Callback: Records / forms", "Needs FMLA paperwork filled out"], ["Callback: Something else", "Question about vaccine for travel"]]
};
function simulate(n, spreadMin) {
  for (let i = 0; i < n; i++) {
    const r = Math.random();
    const type = r < .38 ? "appt" : r < .58 ? "refill" : r < .76 ? "triage" : r < .88 ? "billing" : r < .95 ? "referral" : "callback";
    const ts = Date.now() - Math.random() * spreadMin * MIN;
    const nm = fakeName(hash(uid()));
    if (type === "appt") {
      const s = openSlots({ days: 6, limit: 12 })[Math.floor(Math.random() * 12)];
      if (s) S.appts.push({ id: uid(), pid: s.pid, start: s.start.toISOString(), mins: 20, type: pick(["Sick visit", "Follow-up", "Telehealth"]), patient: nm, phone: "", status: "booked", created: ts, source: "hush" });
      logEvent("appt", "self", ts); continue;
    }
    const [title, body] = pick(SIM[type]);
    const urgency = type === "triage" ? pick(["high", "med", "med", "low"]) : type === "refill" ? pick(["high", "med", "low"]) : type === "callback" ? "med" : "low";
    const req = { type, patient: nm, phone: "(215) 555-0" + (100 + Math.floor(Math.random() * 899)), urgency, title, body, created: ts };
    if (type === "callback") req.due = ts + (20 + Math.random() * 60) * MIN;
    if (type === "billing" && Math.random() < .5) { logEvent("billing", "self", ts); continue; }
    addRequest(req); logEvent(type, "routed", ts);
  }
  save();
}

/* ---------------- insights: volume model + Erlang C ---------------- */
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const DAYW = [1.32, 1.0, 0.95, 0.93, 0.8];
function hourWeight(wd, h) { // wd: 1..5
  const st = S.settings; let w = 1;
  if (h < st.open || h >= st.close || h === st.lunch) return h === st.lunch ? 0.55 : 0;
  if (h === st.open) w = wd === 1 ? 2.3 : 1.6;
  else if (h === st.open + 1) w = wd === 1 ? 1.9 : 1.3;
  else if (h === st.lunch + 1) w = 1.55;
  else if (h === st.close - 1) w = 1.5;
  else if (h === st.close - 2) w = 1.25;
  return w * (DAYW[wd - 1] || 1);
}
function volumeGrid() {
  const st = S.settings, perDay = st.callsPerMd * st.physicians; const hours = [];
  for (let h = st.open; h < st.close; h++) hours.push(h);
  const weekW = DAYS.reduce((s, _, i) => s + hours.reduce((t, h) => t + hourWeight(i + 1, h), 0), 0);
  const weekCalls = perDay * 5;
  return { hours, grid: DAYS.map((_, i) => hours.map(h => weekCalls * hourWeight(i + 1, h) / weekW)) };
}
function erlangAgents(callsPerHour, ahtMin, slaSec, slaPct) {
  if (callsPerHour <= 0) return 0;
  const A = callsPerHour * ahtMin / 60;
  for (let N = Math.max(1, Math.ceil(A + 0.0001)); N < 200; N++) {
    // Erlang B recursion, then C
    let B = 1; for (let k = 1; k <= N; k++) B = (A * B) / (k + A * B);
    const C = N * B / (N - A * (1 - B));
    const sl = 1 - C * Math.exp(-(N - A) * (slaSec / 60) / ahtMin);
    if (sl >= slaPct / 100) return N;
  }
  return 200;
}
const RAMP = ["#cde2fb", "#9ec5f4", "#6da7ec", "#3987e5", "#256abf", "#184f95", "#0d366b"];
const tip = $("#tip");
function bindTips(root) {
  root.querySelectorAll("[data-tip]").forEach(el => {
    el.addEventListener("mousemove", e => { tip.innerHTML = el.dataset.tip; tip.classList.add("on"); tip.style.left = Math.min(innerWidth - 250, e.clientX + 14) + "px"; tip.style.top = (e.clientY + 14) + "px"; });
    el.addEventListener("mouseleave", () => tip.classList.remove("on"));
  });
}
const bar = (x, y, w, h, r) => { r = Math.min(r, w / 2, h); return h <= 0 ? "" : `M${x},${y + h}V${y + r}Q${x},${y} ${x + r},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + h}Z`; };
const hl = h => (h % 12 || 12) + (h < 12 ? "a" : "p");

function renderInsights() {
  const st = S.settings, d = st.deflect / 100, aht = st.aht;
  $("#defOut").textContent = st.deflect + "%"; $("#ahtOut").textContent = aht.toFixed(1) + " min";
  $("#deflect").value = st.deflect; $("#aht").value = aht;
  const { hours, grid } = volumeGrid();

  // KPIs
  const perDay = st.callsPerMd * st.physicians, annual = perDay * 250;
  const hrsSaved = annual * d * aht / 60;
  const mon = grid[0];
  const before = mon.map(c => erlangAgents(c, aht, st.slaSec, st.slaPct));
  const after = mon.map(c => erlangAgents(c * (1 - d), aht, st.slaSec, st.slaPct));
  const peakB = Math.max(...before), peakA = Math.max(...after);
  $("#roiKpis").innerHTML = [
    [perDay.toLocaleString(), `calls/day today (${st.physicians} MDs × ${st.callsPerMd})`],
    [Math.round(annual * d).toLocaleString(), "calls/year handled without staff"],
    [Math.round(hrsSaved).toLocaleString() + " h", `staff phone hours saved/year (≈ ${(hrsSaved / 2000).toFixed(1)} FTE)`],
    [`${peakB} → ${peakA}`, "phone staff needed at the Monday peak"],
    [money(hrsSaved * st.wage), "phone labor saved per year", true]
  ].map(k => `<div class="kpi${k[2] ? " hl" : ""}"><div class="v">${k[0]}</div><div class="l">${k[1]}</div></div>`).join("");

  // heatmap
  const all = grid.flat(), max = Math.max(...all), min = Math.min(...all.filter(v => v > 0));
  const cw = 46, ch = 34, L = 38, T = 20, W = L + hours.length * cw, H = T + 5 * ch + 6;
  const step = v => RAMP[Math.min(RAMP.length - 1, Math.floor((v - min) / (max - min + 1e-9) * RAMP.length))];
  let svg = `<svg viewBox="0 0 ${W} ${H}" width="100%" class="hm" role="img" aria-label="Heatmap of predicted calls per hour, Monday to Friday">`;
  hours.forEach((h, j) => svg += `<text x="${L + j * cw + cw / 2}" y="13" text-anchor="middle">${hl(h)}</text>`);
  grid.forEach((row, i) => {
    svg += `<text x="${L - 8}" y="${T + i * ch + ch / 2 + 4}" text-anchor="end">${DAYS[i]}</text>`;
    row.forEach((v, j) => {
      const dark = RAMP.indexOf(step(v)) >= 3;
      svg += `<g data-tip="<b>${DAYS[i]} ${hl(hours[j])}m</b><br>${Math.round(v)} calls/hour predicted<br>${Math.round(v * (1 - d))} with Hush"><rect x="${L + j * cw}" y="${T + i * ch}" width="${cw}" height="${ch}" rx="4" fill="${step(v)}"/>
        <text x="${L + j * cw + cw / 2}" y="${T + i * ch + ch / 2 + 4}" text-anchor="middle" style="fill:${dark ? "#fff" : "#0f1222"};font-weight:600">${Math.round(v)}</text></g>`;
    });
  });
  $("#heatmap").innerHTML = svg + "</svg>";

  // staffing grouped bars (Monday)
  const sw = 520, sh = 230, pl = 28, pb = 22, pt = 18, gw = (sw - pl) / hours.length, bw = Math.min(18, (gw - 10) / 2);
  const ymax = Math.max(peakB, 1) + 1, y = v => pt + (sh - pt - pb) * (1 - v / ymax);
  let s2 = `<svg viewBox="0 0 ${sw} ${sh}" width="100%" role="img" aria-label="Phone staff needed per hour on Monday, with and without Hush">`;
  for (let g = 0; g <= ymax; g += Math.max(1, Math.ceil(ymax / 5))) s2 += `<line x1="${pl}" x2="${sw}" y1="${y(g)}" y2="${y(g)}" stroke="#eceef4"/><text x="${pl - 6}" y="${y(g) + 4}" text-anchor="end">${g}</text>`;
  hours.forEach((h, j) => {
    const cx = pl + j * gw + gw / 2;
    s2 += `<path d="${bar(cx - bw - 1, y(before[j]), bw, sh - pb - y(before[j]), 4)}" fill="var(--s1)"/>`;
    s2 += `<path d="${bar(cx + 1, y(after[j]), bw, sh - pb - y(after[j]), 4)}" fill="var(--s2)"/>`;
    s2 += `<text x="${cx}" y="${sh - 6}" text-anchor="middle">${hl(h)}</text>`;
    s2 += `<rect class="hit" x="${pl + j * gw}" y="${pt}" width="${gw}" height="${sh - pt - pb}" data-tip="<b>Mon ${hl(h)}m</b><br>${Math.round(mon[j])} calls → ${Math.round(mon[j] * (1 - d))} with Hush<br>Staff: <b>${before[j]}</b> phones only · <b>${after[j]}</b> with Hush"/>`;
  });
  s2 += `<line x1="${pl}" x2="${sw}" y1="${sh - pb}" y2="${sh - pb}" stroke="#c9ccd8"/>`;
  $("#staffChart").innerHTML = s2 + "</svg>";
  $("#staffTable").innerHTML = `<table class="t"><tr><th>Hour</th><th>Calls</th><th>Staff (phones)</th><th>Calls w/ Hush</th><th>Staff w/ Hush</th></tr>${hours.map((h, j) => `<tr><td>${hl(h)}m</td><td>${Math.round(mon[j])}</td><td>${before[j]}</td><td>${Math.round(mon[j] * (1 - d))}</td><td>${after[j]}</td></tr>`).join("")}</table>`;

  // request mix (single series)
  const counts = Object.keys(TYPES).map(t => ({ t, n: S.log.filter(l => l.type === t).length, self: S.log.filter(l => l.type === t && l.outcome === "self").length }));
  const mmax = Math.max(1, ...counts.map(c => c.n));
  const mw = 520, rh = 30, ml = 150, mh = counts.length * rh + 8;
  let s3 = `<svg viewBox="0 0 ${mw} ${mh}" width="100%" role="img" aria-label="Requests by type">`;
  counts.forEach((c, i) => {
    const w = (mw - ml - 60) * c.n / mmax, yy = 4 + i * rh;
    s3 += `<g data-tip="<b>${TYPES[c.t].label}</b><br>${c.n} requests · ${c.self} finished without staff"><rect class="hit" x="0" y="${yy}" width="${mw}" height="${rh}"/>
      <text x="${ml - 10}" y="${yy + rh / 2 + 4}" text-anchor="end" style="font-size:12.5px">${TYPES[c.t].icon} ${TYPES[c.t].label}</text>
      ${w > 0 ? `<path d="M${ml},${yy + 6}H${ml + w - 4}Q${ml + w},${yy + 6} ${ml + w},${yy + 10}V${yy + rh - 10}Q${ml + w},${yy + rh - 6} ${ml + w - 4},${yy + rh - 6}H${ml}Z" fill="var(--s1)"/>` : ""}
      <text class="val" x="${ml + w + 6}" y="${yy + rh / 2 + 4}">${c.n}</text></g>`;
  });
  const tot = S.log.length, selfAll = S.log.filter(l => l.outcome === "self").length;
  $("#mixChart").innerHTML = s3 + `</svg><p class="note"><b>${tot}</b> requests so far · <b>${tot ? Math.round(selfAll / tot * 100) : 0}%</b> finished with no staff time${S.log.some(l => l.demo) ? " (includes seeded demo history)" : ""}.</p>`;
  bindTips($("#v-insights"));
}
$("#deflect").oninput = e => { S.settings.deflect = +e.target.value; save(); renderInsights(); };
$("#aht").oninput = e => { S.settings.aht = +e.target.value; save(); renderInsights(); };

/* ---------------- setup ---------------- */
function renderSetup() {
  const st = S.settings;
  $("#setupForm").innerHTML = `<h3>Practice</h3>
    <label>Clinic name<input name="clinic" value="${esc(st.clinic)}"></label>
    <label>Specialty (sets typical calls per physician per day)<select name="specialty">${Object.entries(SPECIALTIES).map(([k, v]) => `<option value="${k}" ${st.specialty === k ? "selected" : ""}>${v.label}${k !== "custom" ? " · " + v.calls + "/day" : ""}</option>`).join("")}</select></label>
    <div class="grid2" style="margin:0;gap:12px">
      <label>Calls per physician per day<input name="callsPerMd" type="number" min="1" value="${st.callsPerMd}"></label>
      <label>Physicians<input name="physicians" type="number" min="1" value="${st.physicians}"></label>
      <label>Opens (hour, 24h)<input name="open" type="number" min="5" max="12" value="${st.open}"></label>
      <label>Closes (hour, 24h)<input name="close" type="number" min="13" max="22" value="${st.close}"></label>
      <label>Lunch hour<input name="lunch" type="number" min="10" max="15" value="${st.lunch}"></label>
      <label>Staff cost per hour, loaded ($)<input name="wage" type="number" min="10" value="${st.wage}"></label>
      <label>Answer within (sec)<input name="slaSec" type="number" min="10" value="${st.slaSec}"></label>
      <label>…for this % of calls<input name="slaPct" type="number" min="50" max="99" value="${st.slaPct}"></label>
    </div>`;
  $("#provList").innerHTML = S.providers.map(p => `<div class="prov"><span class="sw" style="background:${p.color}"></span>${esc(p.name)}<button class="btn sm ghost" data-del="${p.id}" ${S.providers.length < 2 ? "disabled" : ""}>Remove</button></div>`).join("");
  paintBrand();
}
$("#setupForm").addEventListener("change", e => {
  const el = e.target, st = S.settings;
  if (el.name === "specialty") { st.specialty = el.value; if (el.value !== "custom") st.callsPerMd = SPECIALTIES[el.value].calls; }
  else if (el.name === "clinic") st.clinic = el.value || "My Clinic";
  else st[el.name] = Math.max(+el.min || 0, +el.value || 0);
  if (st.close <= st.open + 2) st.close = st.open + 3;
  save(); renderSetup(); toast("Saved");
});
$("#provList").addEventListener("click", e => { const b = e.target.closest("[data-del]"); if (!b) return; S.providers = S.providers.filter(p => p.id !== b.dataset.del); save(); renderSetup(); });
$("#addProv").onsubmit = e => { e.preventDefault(); const n = $("#provName").value.trim(); if (!n) return; S.providers.push({ id: "p" + uid(), name: n, color: PCOLORS[S.providers.length % PCOLORS.length] }); $("#provName").value = ""; save(); renderSetup(); toast("Provider added"); };
$("#resetAll").onclick = () => { if (!confirm("Reset all demo data?")) return; localStorage.removeItem(KEY); location.reload(); };
function paintBrand() { $("#clinicName").textContent = S.settings.clinic; $("#phoneClinic").textContent = S.settings.clinic; document.title = "Hush · " + S.settings.clinic; }

/* ---------------- tabs + boot ---------------- */
function show(v) {
  document.querySelectorAll(".view").forEach(x => x.classList.toggle("on", x.id === "v-" + v));
  document.querySelectorAll("#tabs button").forEach(b => b.classList.toggle("on", b.dataset.view === v));
  if (v === "desk") renderDesk(); if (v === "insights") renderInsights(); if (v === "setup") renderSetup();
  if (location.hash !== "#" + v) history.replaceState(null, "", "#" + v);
}
$("#tabs").addEventListener("click", e => { const b = e.target.closest("button"); if (b) show(b.dataset.view); });

if (!S.seeded) {
  // a believable starting state: demo patient's upcoming visit + a few requests + some history
  const s = openSlots({ pid: "p1", days: 10, skip: 20, limit: 1 })[0];
  if (s) S.appts.push({ id: uid(), pid: "p1", start: s.start.toISOString(), mins: 20, type: "Follow-up", patient: DEMO.name, phone: DEMO.phone, status: "booked", created: Date.now() - 864e5 * 6, source: "staff" });
  simulate(9, 120);
  S.log.forEach(l => l.demo = true);
  S.seeded = true; save();
}
paintBrand(); refreshCounts();
setInterval(() => { if ($("#v-desk").classList.contains("on")) renderDesk(); }, 30000);
const initial = location.hash.slice(1);
show(["patient", "desk", "insights", "setup"].includes(initial) ? initial : "patient");
start();
})();
