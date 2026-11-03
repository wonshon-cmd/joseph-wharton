'use strict';
// CMS NPPES NPI Registry (public, free, no key): https://npiregistry.cms.hhs.gov/api-page
// Used to (1) auto-fill an organization's name, address, phone and FAX, and (2) verify organizations at sign-up.
const API = 'https://npiregistry.cms.hhs.gov/api/?version=2.1';
const ENABLED = process.env.SL_NPI_LOOKUP !== 'false';

function digits(s) { return String(s || '').replace(/\D/g, ''); }

function shape(r) {
  const b = r.basic || {};
  const loc = (r.addresses || []).find((a) => a.address_purpose === 'LOCATION') || (r.addresses || [])[0] || {};
  const tax = (r.taxonomies || []).find((t) => t.primary) || (r.taxonomies || [])[0] || {};
  const person = r.enumeration_type === 'NPI-1';
  return {
    npi: String(r.number),
    name: person ? [b.first_name, b.last_name].filter(Boolean).join(' ') + (b.credential ? `, ${b.credential}` : '') : (b.organization_name || ''),
    isPerson: person,
    specialty: tax.desc || '',
    address: [loc.address_1, loc.city, loc.state, String(loc.postal_code || '').slice(0, 5)].filter(Boolean).join(', '),
    phone: digits(loc.telephone_number),
    fax: digits(loc.fax_number),
  };
}

async function call(params) {
  if (!ENABLED) return [];
  const url = API + Object.entries(params).filter(([, v]) => v).map(([k, v]) => `&${k}=${encodeURIComponent(v)}`).join('');
  const res = await fetch(url, { signal: AbortSignal.timeout(8000), headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`NPI registry HTTP ${res.status}`);
  const j = await res.json();
  return (j.results || []).map(shape);
}

/** Exact lookup of a 10-digit NPI. Returns null if not found / unavailable. */
async function lookup(npi) {
  if (!/^\d{10}$/.test(digits(npi))) return null;
  try { return (await call({ number: digits(npi) }))[0] || null; } catch { return null; }
}

/** Search organizations by name (+ optional city/state). */
async function search({ name, city, state }) {
  const n = String(name || '').trim();
  if (/^\d{10}$/.test(digits(n)) && digits(n).length === n.replace(/\s/g, '').length) {
    const one = await lookup(n); return one ? [one] : [];
  }
  if (n.length < 2) return [];
  try {
    return await call({ organization_name: n.endsWith('*') ? n : `${n}*`, city, state: String(state || '').toUpperCase().slice(0, 2), enumeration_type: 'NPI-2', limit: 15 });
  } catch { return []; }
}

/** Loose name match, so "CVS Pharmacy #1234" verifies against "CVS PHARMACY". */
function namesMatch(a, b) {
  const norm = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter((w) => w.length > 2 && !['inc', 'llc', 'the', 'corp', 'ltd'].includes(w));
  const A = norm(a), B = new Set(norm(b));
  return A.length > 0 && A.filter((w) => B.has(w)).length >= Math.min(2, A.length);
}

module.exports = { lookup, search, namesMatch, digits, ENABLED };
