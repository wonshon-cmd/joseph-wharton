# Joseph Wharton

My Wharton coursework, study tools, and saved practice records, all in one website.

**Live site:** https://wonshon-cmd.github.io/joseph-wharton/

## Structure

```
index.html                      ← Joseph Wharton home (all terms + "jump back in" progress)
google-apps-script/Code.gs      ← the Google save spot (deploy once in your Google account)
sync.html                       ← ☁️ cloud sync setup / status for this device
assets/
  catalog.js                    ← THE file to edit when adding terms / courses / links
  hub.css, hub.js               ← shared look + page rendering
  sync.js                       ← cloud sync engine (records → Google Drive save spot)
term-3/
  index.html                    ← Term 3 (lists its courses)
  mktg-6110/
    index.html                  ← MKTG 6110 course home (progress + all materials)
    practice/                   ← 10 exam topics, auto-graded practice, My Records
    study-guide/                ← full study guide app
    cheat-sheets/               ← max.html/.pdf, with-space.html/.pdf
    pdfs/                       ← deep-dive-all-topics.pdf + by-topic/*.pdf
```

## Adding a new course or term

1. Make a folder, e.g. `term-3/fnce-6110/` (or `term-4/...`), and put the course's files in it.
2. Copy `term-3/mktg-6110/index.html` into the new folder and change `data-course="..."` (and `data-term`) to match.
3. For a new term, copy `term-3/index.html` into `term-4/` and change `data-term`.
4. Add the course (and term) to `assets/catalog.js`, which drives every page.

## Your records (cloud sync)

Every practice answer, essay, score, and draft syncs online, so it's the same on every device.

**Main method: Google save spot** (same approach as the Pivot or Perish "permanent board")
- `google-apps-script/Code.gs` is a tiny Google Apps Script web app that stores everything in one file in Google Drive (`joseph-wharton-progress.json`, plus one dated backup per day).
- Deploy it once (script.google.com → paste Code.gs → run `setup` → Deploy as Web app, *Execute as: Me*, *Who has access: Anyone*), then put the `/exec` URL in `CFG.gasUrl` at the top of `assets/sync.js`.
- After that, every device syncs automatically, with no per-device setup. Status: ☁️ button bottom-right on every page → `sync.html`.
- Works offline; changes sync when back online. Histories from different devices are merged, never overwritten.
- The Anthropic API key (optional Claude grading) is never sent to the save spot.

**Alternative:** private GitHub repo (`joseph-wharton-data`) + fine-grained token per device (used only if `gasUrl` is empty). See "Advanced" on `sync.html`.

Engine: `assets/sync.js`. It syncs the localStorage keys listed in `CFG.keys` (add new apps' keys there).
