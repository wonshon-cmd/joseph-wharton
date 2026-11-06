# Carepak Pharmacy: /onboarding and /letstalk

Draft pages for **carepakpharmacy.com/onboarding** and **carepakpharmacy.com/letstalk** (site hosted on Wix).

| File | What it is |
|---|---|
| `onboarding.html` | New-patient page: how switching works, what to bring, services, "request a call" form, FAQ |
| `letstalk.html` | Contact page: call, text, email, visit cards, message form, hours, info for prescribers |
| `carepak.css` / `carepak.js` | Shared styles; preview-only form handler (opens an email) |

Every `[BRACKETED]` item is a placeholder. The list of what's needed is at the bottom.

Preview: https://wonshon-cmd.github.io/joseph-wharton/carepak-pharmacy/onboarding.html
(works once this branch is merged to the branch GitHub Pages serves)

---

## Putting the pages on Wix

Wix pages are built in the Wix Editor, not uploaded as files. The HTML here is the **content and layout to build**. Each step below takes a few minutes.

### 1. Create the page and set the URL
1. Open the site in the **Wix Editor** (or Wix Studio).
2. **Pages & Menu** → **+ Add Page** → **Blank page** (or a "Contact" template for Let's Talk).
3. Name it `Getting Started` (or `Let's Talk`).
4. On the page, click **⋯** → **SEO basics** → **URL slug** → type `onboarding` (or `letstalk`).
   That makes the address `carepakpharmacy.com/onboarding`.
5. Optional: to keep the page off the top menu, click **⋯** → **Hide from menu**. The link will still work.

### 2. Add the content
Rebuild the sections with Wix's own elements so they match the rest of your site and stay easy to edit:

- Text sections: **Add (+)** → **Text**. Copy the wording from the HTML files.
- The 4 steps and the contact cards: **Add** → **Strip** or **Repeater**.
- FAQ: **Add** → **Interactive** → **Accordion** (or the Wix FAQ app).
- Map: **Add** → **Contact & Forms** → **Google Maps**.
- Phone/email buttons: **Add** → **Button** → link to **Phone** / **Email**.

### 3. Forms: use Wix Forms
**Add** → **Contact & Forms** → pick a form, then set the fields to match:
- Onboarding: Name, Phone, Email (optional), Best time to call, Current pharmacy (optional), consent checkbox.
- Let's Talk: Name, Phone, Email, Topic (dropdown), Message.

Submissions go to **Wix Dashboard → Inbox / Forms & Submissions**, with email notifications.

> ⚠️ **Patient privacy (HIPAA).** Standard Wix Forms are not HIPAA-compliant, and Wix generally won't sign a Business Associate Agreement. Keep these forms to contact details only (no medications, conditions, DOB, or insurance IDs). The pages already tell visitors this. If you want online prescription transfers or full intake, use a HIPAA-compliant form service that signs a BAA (for example Jotform HIPAA, IntakeQ, or a pharmacy-system portal) and link or embed it.

### Option B: paste the HTML as-is (faster, less flexible)
**Add** → **Embed Code** → **Embed HTML** → paste the page code with the CSS inlined. Downsides: it shows in a fixed-size frame, isn't indexed well by Google, and the form can only open an email. Fine for a quick test, not recommended as the final page.

---

## Information I need from you

**Basics (both pages)**
- [ ] Phone, fax, text number (if any), email
- [ ] Street address + Google Maps link
- [ ] Hours (and holiday/after-hours note)
- [ ] Logo file and brand colors (or "match the current site")
- [ ] NPI and NCPDP numbers (for the prescriber section; remove if you'd rather not show them)

**Onboarding page**
- [ ] One-line pitch: what makes Carepak different
- [ ] Services list (packaging, delivery, refill sync, vaccines, compounding, long-term care, …)
- [ ] Delivery area, days, cost
- [ ] Insurance plans accepted
- [ ] How long a transfer usually takes; how quickly you call people back
- [ ] Anything else new patients should have ready
- [ ] FAQ answers (or new questions you get often)

**Let's Talk page**
- [ ] Topics for the dropdown (add/remove)
- [ ] Who it's for: patients only, or also clinics, care homes, or caregivers?

**Decisions**
- [ ] Final URLs: `/onboarding` and `/letstalk`? (Alternatives: `/get-started`, `/new-patients`, `/contact`)
- [ ] Should these pages show in the main menu or be link-only (e.g., for flyers or QR codes)?
