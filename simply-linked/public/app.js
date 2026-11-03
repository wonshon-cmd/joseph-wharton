'use strict';
// Simply Linked front end. Plain JavaScript, no frameworks, no third-party code.
// Patient information is never written to localStorage / sessionStorage / IndexedDB.
(() => {
  const $app = document.getElementById('app');
  const S = { me: null, threads: [], closed: false, filter: 'all', current: null, orgs: null, es: null };

  // ---------- tiny DOM helper (always uses textContent, never innerHTML) ----------
  function h(tag, attrs, ...kids) {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v === false || v === null || v === undefined) continue;
      if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
      else if (k === 'class') el.className = v;
      else if (k === 'value') el.value = v;
      else if (k === 'style') el.style.cssText = v; // CSSOM is allowed by our strict CSP; style="" attributes are not
      else el.setAttribute(k, v === true ? '' : v);
    }
    for (const kid of kids.flat(Infinity)) if (kid !== null && kid !== undefined && kid !== false) el.append(kid instanceof Node ? kid : document.createTextNode(String(kid)));
    return el;
  }
  const mount = (...nodes) => { $app.replaceChildren(...nodes); window.scrollTo(0, 0); };
  const go = (hash) => { if (location.hash === hash) render(); else location.hash = hash; };
  function toast(msg) { const t = document.getElementById('toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('show'), 3200); }
  const fmt = (ms) => {
    if (!ms) return '';
    const d = new Date(ms), now = new Date();
    const time = d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    if (d.toDateString() === now.toDateString()) return time;
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ', ' + time;
  };
  const logo = () => h('a', { class: 'logo', href: '#/' }, h('img', { src: 'icon.svg', alt: '' }), h('span', { class: 'logo-text' }, 'Simply Linked'));

  async function api(method, path, body) {
    const res = await fetch(path, {
      method, credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json', 'X-Simply-Linked': '1' },
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err = new Error(data.error || 'Something went wrong.'); err.status = res.status;
      if (res.status === 401 && S.me && !path.startsWith('/api/mfa') && !path.startsWith('/api/login')) { S.me = null; stopLive(); go('#/login'); toast('You were signed out.'); }
      throw err;
    }
    return data;
  }

  /** Wires a form: collects named fields, shows errors, disables the button while working. */
  function form(fields, submitLabel, onSubmit, extra) {
    const err = h('div', { class: 'err hidden', role: 'alert' });
    const btn = h('button', { class: 'btn primary big', type: 'submit' }, submitLabel);
    const f = h('form', { novalidate: true }, err, fields, h('div', { style: 'margin-top:1.2em' }, btn), extra);
    f.addEventListener('submit', async (e) => {
      e.preventDefault(); err.classList.add('hidden'); btn.disabled = true;
      const data = Object.fromEntries(new FormData(f).entries());
      try { await onSubmit(data, f); } catch (x) { err.textContent = x.message; err.classList.remove('hidden'); } finally { btn.disabled = false; }
    });
    return f;
  }
  const field = (label, attrs, opt) => [h('label', { for: attrs.name }, label, opt ? h('span', { class: 'opt' }, ' (optional)') : null), h('input', { id: attrs.name, ...attrs })];
  const select = (label, name, options, value) => [h('label', { for: name }, label),
    h('select', { id: name, name, required: true }, h('option', { value: '' }, 'Choose...'), Object.entries(options).map(([k, v]) => h('option', { value: k, selected: k === value }, v)))];

  // ---------- Session / idle sign-out ----------
  let lastActivity = Date.now(), lastPing = Date.now(), idleWarned = false;
  ['pointerdown', 'keydown', 'scroll', 'touchstart'].forEach((ev) => addEventListener(ev, () => { lastActivity = Date.now(); if (idleWarned) closeModal(); idleWarned = false; }, { passive: true }));
  setInterval(async () => {
    if (!S.me || !S.me.mfaOk) return;
    const idleMs = (S.me.idleMinutes || 15) * 60_000, idle = Date.now() - lastActivity;
    if (idle >= idleMs) { await signOut('idle'); toast('Signed out after inactivity to protect patient privacy.'); return; }
    if (idle >= idleMs - 60_000 && !idleWarned) { idleWarned = true; modal('Still there?', 'For privacy you will be signed out in 1 minute.', 'I\'m here', () => {}); }
    if (idle < 60_000 && Date.now() - lastPing > 60_000) { lastPing = Date.now(); api('POST', '/api/ping').catch(() => {}); }
  }, 10_000);

  async function signOut(reason) { try { await api('POST', '/api/logout', { reason }); } catch {} S.me = null; S.threads = []; S.current = null; stopLive(); closeModal(); go('#/'); }

  let modalEl = null;
  function modal(title, text, okLabel, onOk, cancelLabel) {
    closeModal();
    modalEl = h('div', { class: 'modal-bg' }, h('div', { class: 'modal', role: 'dialog', 'aria-modal': 'true' },
      h('h3', {}, title), typeof text === 'string' ? h('p', {}, text) : text,
      h('div', { style: 'display:flex;gap:8px;justify-content:flex-end;margin-top:1em' },
        cancelLabel ? h('button', { class: 'btn', onclick: closeModal }, cancelLabel) : null,
        h('button', { class: 'btn primary', onclick: async () => { closeModal(); await onOk(); } }, okLabel))));
    document.body.append(modalEl);
  }
  function closeModal() { if (modalEl) modalEl.remove(); modalEl = null; }

  // ---------- Live updates (server sends only "something changed", never content) ----------
  function startLive() {
    if (S.es) return;
    S.es = new EventSource('/api/events');
    S.es.onmessage = () => { refreshInbox(); if (S.current) loadThread(S.current, true); };
  }
  function stopLive() { if (S.es) S.es.close(); S.es = null; }

  // ---------- Public pages ----------
  function landing() {
    mount(h('div', { class: 'center' }, h('div', { class: 'panel hero' },
      logo(),
      h('h1', {}, 'Talk to the whole care team, in one place.'),
      h('p', { class: 'muted' }, 'Secure, HIPAA-ready text messaging for clinics, pharmacies, DME suppliers, visiting nurses, day cares and every other provider a patient depends on. Messaging is free, forever.'),
      h('div', { class: 'stack', style: 'margin-top:1.4em' },
        h('a', { class: 'btn primary big', href: '#/signup' }, 'Create free account'),
        h('a', { class: 'btn big', href: '#/login' }, 'Sign in'),
        h('a', { class: 'btn big', href: '#/fax' }, '📠  I got a fax with a code')),
      h('p', { class: 'small muted', style: 'margin-top:1.4em' }, 'Every message is encrypted. Every view is logged. Two-step sign-in protects every account.'))));
  }

  function loginPage() {
    mount(h('div', { class: 'center' }, h('div', { class: 'panel' }, logo(), h('h2', { style: 'margin-top:1em' }, 'Sign in'),
      form([
        field('Email', { name: 'email', type: 'email', autocomplete: 'username', required: true, autofocus: true }),
        field('Password', { name: 'password', type: 'password', autocomplete: 'current-password', required: true }),
      ], 'Sign in', async (d) => { const r = await api('POST', '/api/login', d); await afterAuth(r.next); }),
      h('p', { class: 'small' }, 'New here? ', h('a', { href: '#/signup' }, 'Create a free account'), '. Forgot your password? Ask your organization\'s admin to reset it.'))));
  }

  async function signupPage() {
    const info = await api('GET', '/api/signup');
    let pickedType = '';
    const typeInput = h('input', { type: 'hidden', name: 'orgType' });
    const chips = h('div', { class: 'chips' }, Object.entries(info.orgTypes).map(([k, v]) => h('button', {
      type: 'button', class: 'chip', onclick: (e) => { pickedType = k; typeInput.value = k; chips.querySelectorAll('.chip').forEach((c) => c.classList.remove('on')); e.currentTarget.classList.add('on'); },
    }, v)));
    const npiNote = h('div', { class: 'small muted' }, 'Your organization\'s 10-digit NPI fills in your details and verifies you, so others know you\'re real.');
    const npiInput = h('input', { id: 'npi', name: 'npi', inputmode: 'numeric', maxlength: 10, placeholder: '10 digits', autocomplete: 'off' });
    const orgInput = h('input', { id: 'orgName', name: 'orgName', required: true, placeholder: 'e.g. Main Street Pharmacy' });
    npiInput.addEventListener('input', async () => {
      const v = npiInput.value.replace(/\D/g, '');
      if (v.length !== 10) return;
      npiNote.textContent = 'Looking up...';
      try {
        const r = await api('GET', `/api/npi/lookup/${v}`);
        if (r.found) { if (!orgInput.value) orgInput.value = r.name; npiNote.textContent = `Found: ${r.name}, ${r.address}`; } else npiNote.textContent = 'Not found in the national registry. You can still sign up.';
      } catch { npiNote.textContent = 'Could not check right now. You can still sign up.'; }
    });
    const refaxBtn = h('button', { type: 'button', class: 'btn hidden', onclick: async () => {
      const r = await api('POST', '/api/claim/refax', { npi: npiInput.value.replace(/\D/g, '') }); toast(r.message); go('#/fax');
    } }, '📠 Fax me the code');
    const f = form([
      info.firstUser ? h('div', { class: 'note' }, 'You are the first person here, so you will be the network admin.') : null,
      field('Your name', { name: 'name', required: true, autocomplete: 'name', placeholder: 'e.g. Ana Lee' }),
      field('Your role', { name: 'title', placeholder: 'e.g. MD, RN, Pharmacist, Office manager' }, true),
      field('Work email', { name: 'email', type: 'email', required: true, autocomplete: 'email' }),
      field('Password', { name: 'password', type: 'password', required: true, autocomplete: 'new-password', minlength: 12, placeholder: '12+ characters, letters and numbers' }),
      h('label', {}, 'Where do you work?'), chips, typeInput,
      h('label', { for: 'orgName' }, 'Organization name'), orgInput,
      h('label', { for: 'npi' }, 'Organization NPI', h('span', { class: 'opt' }, ' (optional, recommended)')), npiInput, npiNote,
      h('label', { class: 'urgent-toggle' }, h('input', { type: 'checkbox', name: 'agree', required: true }),
        h('span', { style: 'font-weight:400' }, 'I will use Simply Linked only for my work as a healthcare provider and only share the minimum patient information needed.')),
    ], 'Create account and start', async (d) => {
      if (!pickedType) throw new Error('Choose where you work.');
      if (!d.agree) throw new Error('Please check the box to continue.');
      try { const r = await api('POST', '/api/signup', d); await afterAuth(r.next); }
      catch (x) { if (x.message.startsWith('WAITING:')) { refaxBtn.classList.remove('hidden'); throw new Error(x.message.slice(9)); } throw x; }
    }, refaxBtn);
    mount(h('div', { class: 'center' }, h('div', { class: 'panel' }, logo(), h('h2', { style: 'margin-top:1em' }, 'Create your free account'),
      h('p', { class: 'muted small' }, 'Takes about a minute. You can message other providers right away.'), f,
      h('p', { class: 'small' }, 'Already have an account? ', h('a', { href: '#/login' }, 'Sign in')))));
  }

  function faxCodePage() {
    mount(h('div', { class: 'center' }, h('div', { class: 'panel' }, logo(), h('h2', { style: 'margin-top:1em' }, '📠 Got a fax from Simply Linked?'),
      h('p', { class: 'muted' }, 'Type the code from the fax. You\'ll read your message in about a minute.'),
      form([h('input', { name: 'code', class: 'code-input', placeholder: 'XXXXX-XXXXX', maxlength: 11, autocomplete: 'off', autofocus: true, 'aria-label': 'Code from the fax', required: true })],
        'Open my message', async (d) => {
          const c = d.code.toUpperCase().replace(/[^A-Z0-9]/g, '');
          if (c.length !== 10) throw new Error('The code has 10 letters and numbers.');
          await api('GET', `/api/claim/${c}`); go(`#/c/${c}`);
        }))));
  }

  async function claimPage(code) {
    let info;
    try { info = await api('GET', `/api/claim/${code}`); } catch (e) {
      return mount(h('div', { class: 'center' }, h('div', { class: 'panel' }, logo(), h('div', { class: 'err' }, e.message), h('a', { class: 'btn', href: '#/fax' }, 'Try again'))));
    }
    if (info.claimed) {
      return mount(h('div', { class: 'center' }, h('div', { class: 'panel' }, logo(), h('h2', { style: 'margin-top:1em' }, `${info.orgName} is already set up`),
        h('p', {}, 'Sign in to read your messages. No account yet? Ask a coworker who has one to invite you (Team page).'), h('a', { class: 'btn primary big', href: '#/login' }, 'Sign in'))));
    }
    mount(h('div', { class: 'center' }, h('div', { class: 'panel' }, logo(),
      h('div', { class: 'note', style: 'margin-top:1em' },
        h('div', { style: 'font-size:1.15rem;font-weight:700' }, `${info.waiting} secure message${info.waiting === 1 ? '' : 's'} waiting for ${info.orgName}`),
        info.from.length ? h('div', {}, 'From: ', info.from.join(', ')) : null),
      h('p', { class: 'muted small' }, 'Create your free account to read and reply. You will be the admin for your organization and can add coworkers later.'),
      form([
        field('Your name', { name: 'name', required: true, autocomplete: 'name', autofocus: true }),
        field('Your role', { name: 'title', placeholder: 'e.g. Pharmacist, Intake coordinator' }, true),
        field('Work email', { name: 'email', type: 'email', required: true, autocomplete: 'email' }),
        field('Password', { name: 'password', type: 'password', required: true, autocomplete: 'new-password', placeholder: '12+ characters, letters and numbers' }),
        field('Organization name', { name: 'orgName', value: info.orgName }),
        h('input', { type: 'hidden', name: 'code', value: code }),
      ], 'Read my message', async (d) => { const r = await api('POST', '/api/claim', d); await afterAuth(r.next); }),
      h('p', { class: 'small muted', style: 'margin-top:1.4em' }, 'Don\'t want fax notices? ',
        h('button', { class: 'btn link small', onclick: () => modal('Stop fax notices?', 'We will stop faxing and the sender will be asked to call you instead.', 'Stop fax notices', async () => { await api('POST', '/api/claim/stop', { code }); toast('Done. No more fax notices.'); go('#/'); }, 'Cancel') }, 'Stop fax notices')))));
  }

  async function invitePage(token) {
    let info;
    try { info = await api('GET', `/api/invite/${token}`); } catch (e) {
      return mount(h('div', { class: 'center' }, h('div', { class: 'panel' }, logo(), h('div', { class: 'err' }, e.message))));
    }
    mount(h('div', { class: 'center' }, h('div', { class: 'panel' }, logo(), h('h2', { style: 'margin-top:1em' }, `Join ${info.orgName}`),
      h('p', { class: 'muted' }, `For ${info.email}`),
      form([
        field('Your name', { name: 'name', required: true, autocomplete: 'name', autofocus: true }),
        field('Your role', { name: 'title', placeholder: 'e.g. RN, Pharmacist, MA' }, true),
        field('Password', { name: 'password', type: 'password', required: true, autocomplete: 'new-password', placeholder: '12+ characters, letters and numbers' }),
        h('input', { type: 'hidden', name: 'token', value: token }),
      ], 'Join and start', async (d) => { const r = await api('POST', '/api/invite/accept', d); await afterAuth(r.next); }))));
  }

  async function mfaPage(setup) {
    const body = [];
    if (setup) {
      const s = await api('POST', '/api/mfa/setup');
      body.push(h('p', {}, 'Open an authenticator app on your phone (Google Authenticator, Microsoft Authenticator, Authy...) and scan this code:'),
        h('img', { class: 'qr', src: s.qr, alt: 'QR code for two-step sign-in' }),
        h('details', {}, h('summary', { class: 'small' }, 'Can\'t scan? Type this key instead'), h('p', { style: 'font-family:monospace;font-size:1.05rem' }, s.secret)));
    } else body.push(h('p', {}, 'Enter the 6-digit code from your authenticator app.'));
    mount(h('div', { class: 'center' }, h('div', { class: 'panel' }, logo(), h('h2', { style: 'margin-top:1em' }, setup ? 'Set up two-step sign-in' : 'Two-step sign-in'),
      body,
      form([h('input', { name: 'code', class: 'code-input', inputmode: 'numeric', autocomplete: 'one-time-code', maxlength: 7, placeholder: '123456', autofocus: true, 'aria-label': '6-digit code', required: true })],
        'Continue', async (d) => { await api('POST', '/api/mfa/verify', d); if (setup) toast('Two-step sign-in is on.'); await afterAuth('app'); }),
      setup && S.me && S.me.mfaOk ? h('p', {}, h('a', { href: '#/' }, 'Not now')) : null,
      h('p', { class: 'small' }, h('button', { class: 'btn link small', onclick: () => signOut() }, 'Sign out')))));
  }

  async function afterAuth(next) {
    S.me = await api('GET', '/api/me');
    if (next === 'mfa') return go('#/mfa');
    if (next === 'mfa-setup') return go('#/mfa-setup');
    go('#/');
  }

  // ---------- App shell ----------
  function topbar() {
    const isAdmin = S.me.user.role === 'admin';
    return h('header', { class: 'top' },
      logo(), h('span', { class: 'org' }, S.me.org.name), h('span', { class: 'spacer' }),
      isAdmin ? h('a', { class: 'btn', href: '#/admin' }, 'Team') : null,
      h('a', { class: 'btn', href: '#/account' }, S.me.user.name.split(' ')[0]),
      h('button', { class: 'btn', onclick: () => signOut() }, 'Sign out'));
  }

  async function refreshInbox() {
    try { S.threads = (await api('GET', `/api/threads${S.closed ? '?closed=1' : ''}`)).threads; } catch { return; }
    const list = document.getElementById('list');
    if (list) list.replaceChildren(...inboxItems());
    const n = S.threads.filter((t) => t.needsAck).length;
    document.title = n ? `(${n}) Simply Linked` : 'Simply Linked';
  }

  function inboxItems() {
    let ts = S.threads;
    if (S.filter === 'ack') ts = ts.filter((t) => t.needsAck);
    if (S.filter === 'waiting') ts = ts.filter((t) => t.waitingOn.length);
    ts = [...ts].sort((a, b) => (b.urgent && b.needsAck) - (a.urgent && a.needsAck) || b.updatedAt - a.updatedAt);
    if (!ts.length) return [h('div', { class: 'empty' }, h('div', { class: 'big' }, S.filter === 'all' ? (S.closed ? 'No closed conversations' : 'No messages yet') : 'Nothing here'),
      S.filter === 'all' && !S.closed ? h('div', {}, 'Tap "New message" to reach a pharmacy, DME, nurse or any provider. If they\'re not on Simply Linked yet, we fax them for you.') : null)];
    return ts.map((t) => h('button', { class: `item${t.unread ? ' unread' : ''}${S.current === t.id ? ' active' : ''}`, onclick: () => go(`#/t/${t.id}`) },
      h('div', { class: 'row1' }, h('span', { class: 'who' }, t.orgs.map((o) => o.name).join(', ') || 'Note'), h('span', { class: 'when' }, fmt(t.updatedAt))),
      h('div', { class: 'subj' }, t.patient ? `${t.patient} · ` : '', t.subject),
      h('div', { style: 'margin-top:4px' },
        t.urgent ? h('span', { class: 'tag urgent' }, 'URGENT') : null,
        t.kind !== 'general' ? h('span', { class: 'tag' }, t.kindLabel) : null,
        t.needsAck ? h('span', { class: 'tag ack' }, 'Needs your "Got it"') : null,
        t.waitingOn.length ? h('span', { class: 'tag wait' }, `Waiting on ${t.waitingOn.join(', ')}`) : null)));
  }

  function shell(mainNode) {
    const tab = (key, label) => h('button', { class: `chip${S.filter === key ? ' on' : ''}`, onclick: () => { S.filter = key; renderShell(mainNode); } }, label);
    const shellEl = h('div', { class: `shell${mainNode ? ' has-main' : ''}` },
      h('aside', { class: 'side' },
        h('div', { class: 'actions' }, h('a', { class: 'btn primary big', href: '#/new' }, '✉️  New message')),
        h('div', { class: 'tabs' }, tab('all', 'All'), tab('ack', 'Needs "Got it"'), tab('waiting', 'Waiting on others'),
          h('button', { class: `chip${S.closed ? ' on' : ''}`, onclick: () => { S.closed = !S.closed; refreshInbox(); renderShell(mainNode); } }, S.closed ? 'Showing closed' : 'Closed')),
        h('div', { class: 'list', id: 'list' }, inboxItems())),
      h('main', { class: 'main', id: 'main' }, mainNode || h('div', { class: 'empty' }, h('div', { class: 'big' }, 'Pick a conversation'), 'or start a new one.')));
    return shellEl;
  }
  function renderShell(mainNode) {
    const banner = !S.me.mfaSetUp ? h('div', { class: 'warnbox', style: 'margin:0;border-radius:0;text-align:center' },
      '🔒 ', h('a', { href: '#/mfa-setup' }, 'Turn on two-step sign-in'), ' (1 min). Required at next sign-in.') : null;
    mount(topbar(), banner, shell(mainNode));
  }

  // ---------- Thread ----------
  async function loadThread(id, quiet) {
    let d;
    try { d = await api('GET', `/api/threads/${id}`); } catch (e) { if (!quiet) { toast(e.message); go('#/'); } return; }
    if (S.current !== id) return;
    const main = document.getElementById('main');
    if (!main) return;
    const draft = main.querySelector('textarea')?.value || '';
    main.replaceChildren(threadView(d, draft));
    const t = S.threads.find((x) => x.id === id); if (t) { t.unread = false; }
  }

  function threadView({ thread: t, messages }, draft) {
    const team = t.allOrgs.map((o) => h('span', {}, o.name, o.onNetwork === false ? ' (via fax)' : '', o.verified ? ' ✓' : ''));
    const ackBar = t.needsAck ? h('div', { class: 'ackbar' },
      h('div', { class: 'txt' }, h('b', {}, 'Let them know you got this.'), h('div', { class: 'small' }, 'The sender sees your name and the time.')),
      h('button', { class: 'btn ok big', style: 'width:auto', onclick: async () => { await api('POST', `/api/threads/${t.id}/ack`); toast('Sent "Got it".'); loadThread(t.id); refreshInbox(); } }, '✓ Got it')) : null;
    const ta = h('textarea', { placeholder: t.closed ? 'This conversation is closed.' : 'Write a reply...', disabled: t.closed, 'aria-label': 'Reply' });
    ta.value = draft || '';
    const sendBtn = h('button', { class: 'btn primary', disabled: t.closed, onclick: async () => {
      if (!ta.value.trim()) return;
      sendBtn.disabled = true;
      try { await api('POST', `/api/threads/${t.id}/messages`, { body: ta.value }); ta.value = ''; await loadThread(t.id); refreshInbox(); } catch (e) { toast(e.message); } finally { sendBtn.disabled = false; }
    } }, 'Send');
    ta.addEventListener('keydown', (e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) sendBtn.click(); });
    return h('div', { class: 'thread' },
      h('div', { class: 'small', style: 'margin-bottom:8px' }, h('a', { href: '#/' }, '← Inbox')),
      h('div', { class: 'thead' },
        h('div', {}, t.urgent ? h('span', { class: 'tag urgent' }, 'URGENT') : null, t.subject !== t.kindLabel ? h('span', { class: 'tag' }, t.kindLabel) : null, t.closed ? h('span', { class: 'tag' }, 'Closed') : null),
        h('h2', { style: 'margin-top:.4em' }, t.subject),
        t.patient ? h('div', { class: 'patient' }, 'Patient: ', t.patient) : null,
        h('div', { class: 'team' }, team),
        h('div', { class: 'small muted', style: 'margin-top:6px' }, `Started by ${t.startedBy}, ${fmt(t.startedAt)}`)),
      h('div', { class: 'msgs' }, messages.map((m) => h('div', { class: `msg${m.mine ? ' mine' : ''}` },
        h('div', { class: 'meta' }, h('b', {}, m.sender), m.senderTitle ? `, ${m.senderTitle}` : '', ` · ${m.senderOrg} · ${fmt(m.at)}`),
        h('div', { class: 'body' }, m.body),
        m.mine ? h('div', { class: 'receipts' }, m.receipts.map((r) => r.by
          ? h('div', { class: 'yes' }, `✓ ${r.org}: got it (${r.by}, ${fmt(r.at)})`)
          : h('div', { class: 'no' }, `○ ${r.org}: ${r.pending ? r.pending.text : 'not confirmed yet'}`))) : null))),
      ackBar,
      h('div', { class: 'reply' }, ta, h('div', { class: 'row' },
        h('button', { class: 'btn', onclick: async () => { await api('POST', `/api/threads/${t.id}/${t.closed ? 'reopen' : 'close'}`); toast(t.closed ? 'Reopened.' : 'Closed. You can find it under "Closed".'); refreshInbox(); loadThread(t.id); } }, t.closed ? 'Reopen' : 'Close conversation'),
        sendBtn)),
      h('p', { class: 'small muted' }, 'Replying also tells everyone you got the messages above.'));
  }

  // ---------- New message ----------
  const TEMPLATES = {
    discharge: 'Discharge date: \nReason for visit / diagnosis: \nNEW medications: \nSTOPPED medications: \nCHANGED doses: \nEquipment / supplies needed: \nNursing / home visits needed: \nFollow-up appointment: \nQuestions? Call: ',
    med_change: 'Medication: \nChange (new / stopped / new dose): \nInstructions: \nReason: \nStarting: ',
    refill: 'Medication & strength: \nQuantity / refills: \nRequest (refill / new Rx / prior auth / clarification): \nNotes: ',
    equipment: 'Equipment / supplies: \nQuantity: \nDiagnosis (ICD-10): \nDelivery address & date: \nOrder / CMN sent? \nNotes: ',
    visit: 'Visit date: \nVitals: \nWhat we saw: \nConcerns: \nNext visit: ',
    question: '',
    general: '',
  };

  async function composePage() {
    if (!S.orgs) S.orgs = await api('GET', '/api/orgs');
    const picked = new Map();
    let kind = 'general';
    const pickedEl = h('div', { class: 'picked' });
    const results = h('div', { class: 'results hidden' });
    const search = h('input', { placeholder: 'Type a name: pharmacy, DME, nurse agency, clinic...', autocomplete: 'off', 'aria-label': 'Search recipients' });
    const err = h('div', { class: 'err hidden', role: 'alert' });

    const drawPicked = () => pickedEl.replaceChildren(...[...picked.values()].map((o) => h('span', { class: 'p' }, o.name, !o.onNetwork ? h('span', { class: 'small muted' }, ' (we\'ll fax)') : null,
      h('button', { type: 'button', 'aria-label': `Remove ${o.name}`, onclick: () => { picked.delete(o.id); drawPicked(); } }, '×'))));
    const add = (o) => { picked.set(o.id, o); drawPicked(); search.value = ''; results.classList.add('hidden'); search.focus(); };

    let npiTimer;
    search.addEventListener('input', () => {
      const term = search.value.trim().toLowerCase();
      if (!term) { results.classList.add('hidden'); return; }
      const local = S.orgs.filter((o) => o.name.toLowerCase().includes(term) || (o.typeLabel || '').toLowerCase().includes(term)).slice(0, 8);
      const rows = local.map((o) => h('button', { type: 'button', onclick: () => add(o) }, o.name,
        o.verified ? ' ✓' : '', h('div', { class: 'sub' }, o.typeLabel, o.address ? ` · ${o.address}` : '', o.onNetwork ? '' : ` · Not on Simply Linked yet, we'll fax ${o.fax || 'them'}`)));
      const npiBox = h('div', { class: 'sub', style: 'padding:10px 12px' }, 'Searching the national provider registry...');
      results.replaceChildren(...rows, npiBox, h('button', { type: 'button', onclick: () => manualAdd(search.value) }, '+ Not listed? Add them with a fax number'));
      results.classList.remove('hidden');
      clearTimeout(npiTimer);
      npiTimer = setTimeout(async () => {
        if (term.length < 3) { npiBox.textContent = 'Keep typing to search the national registry (or type a 10-digit NPI).'; return; }
        try {
          const r = await api('GET', `/api/npi/search?name=${encodeURIComponent(search.value.trim())}`);
          const extra = r.results.filter((x) => !x.existingId || !S.orgs.some((o) => o.id === x.existingId));
          if (!extra.length) { npiBox.textContent = r.available ? 'No more matches in the national registry.' : ''; return; }
          npiBox.replaceWith(...extra.slice(0, 8).map((x) => h('button', { type: 'button', onclick: async () => {
            if (!x.fax && !x.phone) return manualAdd(x.name, x);
            const res = await api('POST', '/api/orgs/add', { name: x.name, type: guessType(x.specialty), fax: x.fax, phone: x.phone, npi: x.npi, address: x.address });
            S.orgs = await api('GET', '/api/orgs');
            add(S.orgs.find((o) => o.id === res.id) || { id: res.id, name: x.name, onNetwork: false });
          } }, x.name, h('div', { class: 'sub' }, `${x.specialty || 'Provider'} · ${x.address}${x.faxPretty ? ` · Fax ${x.faxPretty}` : ''} · NPI ${x.npi}`))));
        } catch { npiBox.textContent = ''; }
      }, 400);
    });

    function manualAdd(name, x) {
      const fname = h('input', { value: name || '', 'aria-label': 'Name' });
      const ftype = h('select', { 'aria-label': 'Type' }, Object.entries(S.me.orgTypes).map(([k, v]) => h('option', { value: k }, v)));
      const ffax = h('input', { placeholder: 'Fax (10 digits)', inputmode: 'tel', value: x?.fax || '' });
      const fphone = h('input', { placeholder: 'Phone (optional)', inputmode: 'tel', value: x?.phone || '' });
      modal('Add someone not on Simply Linked', h('div', {}, h('p', { class: 'small muted' }, 'We fax them a notice (no patient info) with a code to read your message. If they don\'t open it, we follow up.'),
        h('label', {}, 'Name'), fname, h('label', {}, 'Type'), ftype, h('label', {}, 'Fax number'), ffax, h('label', {}, 'Phone'), fphone),
      'Add', async () => {
        try {
          const res = await api('POST', '/api/orgs/add', { name: fname.value, type: ftype.value, fax: ffax.value, phone: fphone.value, npi: x?.npi });
          S.orgs = await api('GET', '/api/orgs');
          add(S.orgs.find((o) => o.id === res.id));
        } catch (e) { toast(e.message); }
      }, 'Cancel');
    }

    const body = h('textarea', { name: 'body', placeholder: 'Write your message...', 'aria-label': 'Message', style: 'min-height:200px' });
    const kindChips = h('div', { class: 'chips' }, Object.entries(S.me.kinds).map(([k, v]) => h('button', {
      type: 'button', class: `chip${k === kind ? ' on' : ''}`, onclick: (e) => {
        const prevTemplate = TEMPLATES[kind] || '';
        kind = k; kindChips.querySelectorAll('.chip').forEach((c) => c.classList.remove('on')); e.currentTarget.classList.add('on');
        if (!body.value.trim() || body.value === prevTemplate) body.value = TEMPLATES[k] || '';
        body.focus();
      },
    }, v)));
    const patient = h('input', { placeholder: 'e.g. Maria Gomez, DOB 03/14/1948', 'aria-label': 'Patient' });
    const subject = h('input', { placeholder: 'Optional short title', 'aria-label': 'Subject', maxlength: 150 });
    const urgent = h('input', { type: 'checkbox' });
    const send = h('button', { class: 'btn primary big', type: 'button', onclick: async () => {
      err.classList.add('hidden'); send.disabled = true;
      try {
        if (!picked.size) throw new Error('Add at least one recipient.');
        const r = await api('POST', '/api/threads', { orgIds: [...picked.keys()], kind, urgent: urgent.checked, patient: patient.value, subject: subject.value, body: body.value });
        const faxed = [...picked.values()].filter((o) => !o.onNetwork).length;
        toast(faxed ? `Sent. We're faxing ${faxed} recipient${faxed > 1 ? 's' : ''} a notice to open it.` : 'Sent.');
        await refreshInbox(); go(`#/t/${r.id}`);
      } catch (e) { err.textContent = e.message; err.classList.remove('hidden'); } finally { send.disabled = false; }
    } }, 'Send');

    const page = h('div', { class: 'compose' },
      h('div', { class: 'small', style: 'margin-bottom:8px' }, h('a', { href: '#/' }, '← Inbox')),
      h('h2', {}, 'New message'),
      h('div', { class: 'card' }, err,
        h('label', {}, 'To ', h('span', { class: 'opt' }, '(add everyone on the patient\'s team: pharmacy, DME, nurse, day care...)')),
        pickedEl, search, results,
        h('label', {}, 'What is it about?'), kindChips,
        h('label', {}, 'Patient ', h('span', { class: 'opt' }, '(name and date of birth, so they find the right person)')), patient,
        h('label', {}, 'Message'), body,
        h('label', { class: 'urgent-toggle' }, urgent, 'Urgent'),
        h('details', {}, h('summary', { class: 'small muted', style: 'margin-top:.8em;cursor:pointer' }, 'Add a title'), subject),
        h('div', { style: 'margin-top:1.2em' }, send),
        h('p', { class: 'small muted' }, 'Share only what the recipient needs for this patient\'s care.')));
    renderShell(page);
    search.focus();
  }
  const guessType = (s) => { s = (s || '').toLowerCase(); return /pharm/.test(s) ? 'pharmacy' : /durable|medical supply|dme|equipment|orthot|prosthe/.test(s) ? 'dme' : /home health|nurs.*agency|hospice/.test(s) ? 'home_health' : /day/.test(s) ? 'day_care' : /hospital/.test(s) ? 'hospital' : /skilled|nursing facility|rehab/.test(s) ? 'snf' : /clinic|physician|practice|center/.test(s) ? 'clinic' : 'other'; };

  // ---------- Account ----------
  function accountPage() {
    const u = S.me.user;
    renderShell(h('div', { class: 'admin' }, h('h2', {}, 'My account'),
      h('div', { class: 'card' }, h('p', {}, h('b', {}, u.name), u.title ? `, ${u.title}` : '', h('br'), u.email, h('br'), `${S.me.org.name} (${S.me.org.typeLabel})`,
        S.me.org.verified ? h('span', { class: 'tag', style: 'margin-left:6px' }, '✓ Verified') : h('span', { class: 'tag unv', style: 'margin-left:6px' }, 'Unverified')),
        S.me.mfaSetUp ? h('p', {}, '🔒 Two-step sign-in is on.') : h('p', {}, h('a', { class: 'btn primary', href: '#/mfa-setup' }, 'Turn on two-step sign-in'))),
      h('h3', { style: 'margin-top:1.2em' }, 'Change password'),
      h('div', { class: 'card' }, form([
        field('Current password', { name: 'current', type: 'password', autocomplete: 'current-password', required: true }),
        field('New password', { name: 'next', type: 'password', autocomplete: 'new-password', required: true }),
      ], 'Change password', async (d, f) => { await api('POST', '/api/me/password', d); f.reset(); toast('Password changed. Other devices were signed out.'); }))));
  }

  // ---------- Team / admin ----------
  async function adminPage() {
    const isSuper = S.me.user.isSuper;
    const wrap = h('div', { class: 'admin' }, h('h2', {}, 'Team'));
    renderShell(wrap);
    const people = await api('GET', '/api/admin/people');
    const inviteOut = h('div');
    wrap.append(h('section', {}, h('h3', {}, `Add a coworker to ${people.orgName}`),
      h('div', { class: 'card' }, form([
        field('Their work email', { name: 'email', type: 'email', required: true }),
        h('label', { class: 'urgent-toggle' }, h('input', { type: 'checkbox', name: 'admin' }), h('span', { style: 'font-weight:400' }, 'Make them an admin (can add people)')),
      ], 'Create invite link', async (d, f) => {
        const r = await api('POST', '/api/admin/invites', { email: d.email, role: d.admin ? 'admin' : 'member' });
        f.reset();
        const linkInput = h('input', { readonly: true, value: r.link, onfocus: (e) => e.target.select() });
        inviteOut.replaceChildren(h('div', { class: 'note' }, h('b', {}, 'Send this link to your coworker'), ` (works once, for ${r.expiresHours} hours). Or let them scan it:`,
          h('img', { class: 'qr', src: r.qr, alt: 'Invite QR code' }), linkInput,
          h('button', { class: 'btn', style: 'margin-top:6px', onclick: async () => { await navigator.clipboard.writeText(r.link); toast('Copied.'); } }, 'Copy link')));
      }), inviteOut)));

    const act = (u, a, label, cls) => h('button', { class: `btn ${cls || ''}`, onclick: async () => { try { await api('POST', `/api/admin/users/${u.id}/${a}`); toast('Done.'); adminPage(); } catch (e) { toast(e.message); } } }, label);
    wrap.append(h('section', {}, h('h3', {}, 'People'), h('table', {}, h('tr', {}, h('th', {}, 'Name'), h('th', {}, 'Email'), h('th', {}, 'Role'), h('th', {}, '')),
      people.users.map((u) => h('tr', {}, h('td', {}, u.name, u.title ? `, ${u.title}` : '', u.active ? '' : ' (deactivated)'), h('td', {}, u.email),
        h('td', {}, u.role === 'admin' ? 'Admin' : 'Member', u.mfa ? ' · 🔒' : ''),
        h('td', {}, u.id === S.me.user.id ? h('span', { class: 'muted small' }, 'You') : h('div', { class: 'row-actions' },
          u.active ? act(u, 'deactivate', 'Remove access', 'danger') : act(u, 'activate', 'Restore'),
          u.role === 'admin' ? act(u, 'make-member', 'Make member') : act(u, 'make-admin', 'Make admin'),
          u.mfa ? act(u, 'reset-mfa', 'Reset two-step') : null)))),
      people.invites.map((i) => h('tr', {}, h('td', { class: 'muted' }, 'Invited'), h('td', {}, i.email), h('td', {}, i.role), h('td', { class: 'small muted' }, `expires ${fmt(i.expires_at)}`)))),
      h('p', { class: 'small muted' }, 'When someone leaves, remove their access right away. They are signed out everywhere immediately.')));

    if (isSuper) {
      const fu = await api('GET', '/api/admin/followups');
      wrap.append(h('section', {}, h('h3', {}, '📞 Follow-up calls (faxes nobody opened yet)'),
        fu.items.length ? h('table', {}, h('tr', {}, h('th', {}, 'Recipient'), h('th', {}, 'Contact'), h('th', {}, 'Status'), h('th', {}, 'Sender'), h('th', {}, '')),
          fu.items.map((o) => h('tr', { style: o.needsCall && !o.calledAt ? 'background:#fff8ec' : '' },
            h('td', {}, h('b', {}, o.org), h('div', { class: 'small muted' }, o.typeLabel)),
            h('td', {}, o.phone ? `☎ ${o.phone}` : '', h('br'), o.fax ? `📠 ${o.fax}` : ''),
            h('td', { class: 'small' }, `${o.waiting} msg waiting · faxed ${o.faxCount}x${o.lastFaxAt ? ` (last ${fmt(o.lastFaxAt)})` : ''}`, o.opened ? ' · opened link' : '', o.noFax ? ' · asked: no faxes' : '',
              o.needsCall ? h('div', { style: 'color:#b45309;font-weight:600' }, 'Please call them') : null,
              o.calledAt ? h('div', { class: 'muted' }, `Called ${fmt(o.calledAt)} by ${o.calledBy}${o.note ? `: ${o.note}` : ''}`) : null),
            h('td', { class: 'small' }, o.sender, o.senderPhone ? h('div', {}, o.senderPhone) : null),
            h('td', {}, h('div', { class: 'row-actions' },
              h('button', { class: 'btn', onclick: () => { const n = h('textarea', { placeholder: 'e.g. Spoke with Tom at front desk, signing up today' }); modal('Log a call', n, 'Save', async () => { await api('POST', `/api/admin/followups/${o.id}/called`, { note: n.value }); adminPage(); }, 'Cancel'); } }, 'Log call'),
              h('button', { class: 'btn', onclick: () => { const n = h('input', { placeholder: 'New fax number (optional)' }); modal('Fax again?', n, 'Send fax', async () => { try { await api('POST', `/api/admin/followups/${o.id}/refax`, { fax: n.value }); toast('Fax sent.'); adminPage(); } catch (e) { toast(e.message); } }, 'Cancel'); } }, 'Re-fax')))))) :
          h('p', { class: 'muted' }, 'Nobody to follow up with right now. 🎉')));

      const orgs = await api('GET', '/api/admin/orgs');
      const orgAct = (o, a, label) => h('button', { class: 'btn', onclick: async () => { await api('POST', `/api/admin/orgs/${o.id}/${a}`); adminPage(); } }, label);
      wrap.append(h('section', {}, h('h3', {}, 'All organizations'), h('table', {}, h('tr', {}, h('th', {}, 'Name'), h('th', {}, 'Type'), h('th', {}, 'People'), h('th', {}, 'Status'), h('th', {}, '')),
        orgs.map((o) => h('tr', {}, h('td', {}, o.name, o.npi ? h('div', { class: 'small muted' }, `NPI ${o.npi}`) : null), h('td', {}, o.typeLabel), h('td', {}, o.people),
          h('td', { class: 'small' }, o.claimed ? 'On Simply Linked' : 'Not joined yet (fax)', o.verified ? ' · ✓ verified' : ' · unverified', o.active ? '' : ' · deactivated'),
          h('td', {}, h('div', { class: 'row-actions' }, o.verified ? orgAct(o, 'unverify', 'Unverify') : orgAct(o, 'verify', 'Verify'), o.active ? orgAct(o, 'deactivate', 'Deactivate') : orgAct(o, 'activate', 'Activate'))))))));
    }

    const aud = await api('GET', `/api/admin/audit${isSuper ? '?all=1' : ''}`);
    wrap.append(h('section', {}, h('h3', {}, 'Activity log'),
      h('p', { class: aud.chain.ok ? 'small' : 'err' }, aud.chain.ok ? `✓ Tamper check passed (${aud.chain.checked} entries). Message text is never stored in this log.` : `⚠ Tamper check FAILED at entry ${aud.chain.brokenAt}. Contact your security officer.`),
      h('button', { class: 'btn', onclick: () => downloadCsv(aud.rows) }, 'Download CSV'),
      h('table', { style: 'margin-top:8px' }, h('tr', {}, h('th', {}, 'When'), h('th', {}, 'Who'), h('th', {}, 'What'), h('th', {}, 'Item'), h('th', {}, 'IP')),
        aud.rows.slice(0, 200).map((r) => h('tr', { style: r.ok ? '' : 'color:#b91c1c' }, h('td', { class: 'small' }, fmt(r.at)), h('td', { class: 'small' }, r.user_name || 'system', r.org_name ? h('div', { class: 'muted' }, r.org_name) : null),
          h('td', { class: 'small' }, r.action), h('td', { class: 'small' }, r.target || ''), h('td', { class: 'small muted' }, r.ip || ''))))));
  }

  function downloadCsv(rows) {
    const cols = ['id', 'at', 'user_name', 'user_email', 'org_name', 'action', 'target', 'ip', 'ok'];
    const esc = (v) => { const s = v === null || v === undefined ? '' : String(v); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
    const csv = [cols.join(','), ...rows.map((r) => cols.map((c) => esc(c === 'at' ? new Date(r.at).toISOString() : r[c])).join(','))].join('\n');
    const a = h('a', { href: URL.createObjectURL(new Blob([csv], { type: 'text/csv' })), download: `simply-linked-audit-${new Date().toISOString().slice(0, 10)}.csv` });
    document.body.append(a); a.click(); a.remove();
  }

  // ---------- Router ----------
  async function render() {
    const hash = location.hash || '#/';
    const [, route, arg] = hash.match(/^#\/([^/]*)\/?(.*)$/) || [];
    try {
      // Public routes
      if (route === 'c' && arg) return claimPage(arg);
      if (route === 'invite' && arg) return invitePage(arg);
      if (route === 'fax') return faxCodePage();
      if (!S.me) S.me = await api('GET', '/api/me');
      if (!S.me.signedIn) {
        S.me = null;
        if (route === 'signup') return signupPage();
        if (route === 'login') return loginPage();
        return landing();
      }
      if (route === 'mfa-setup') return mfaPage(true);
      if (!S.me.mfaOk) return mfaPage(!S.me.mfaSetUp);
      if (route === 'mfa' || route === 'login' || route === 'signup') return go('#/');
      startLive();
      if (!S.threads.length) await refreshInbox();
      S.current = null;
      if (route === 't' && arg) { S.current = Number(arg); renderShell(h('div', { class: 'thread muted' }, 'Loading...')); return loadThread(S.current); }
      if (route === 'new') return composePage();
      if (route === 'admin' && S.me.user.role === 'admin') return adminPage();
      if (route === 'account') return accountPage();
      renderShell(null);
      refreshInbox();
    } catch (e) {
      if (e.status !== 401) mount(h('div', { class: 'center' }, h('div', { class: 'panel' }, logo(), h('div', { class: 'err' }, e.message), h('a', { class: 'btn', href: '#/' }, 'Start over'))));
    }
  }
  addEventListener('hashchange', render);
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
  render();
})();
