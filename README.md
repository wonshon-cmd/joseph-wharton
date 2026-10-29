# Joseph Wharton

My Wharton coursework, study tools, and saved practice records, all in one website.

**Live site:** https://wonshon-cmd.github.io/joseph-wharton/

## Structure

```
index.html                      ← Joseph Wharton home (all terms + "jump back in" progress)
sync.html                       ← ☁️ cloud sync setup / status for this device
assets/
  catalog.js                    ← THE file to edit when adding terms / courses / links
  hub.css, hub.js               ← shared look + page rendering
  sync.js                       ← cloud sync engine (records → private data repo)
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

Every practice answer, essay, score, and draft syncs to **one private file** (`progress.json`) in the private repo **`wonshon-cmd/joseph-wharton-data`**, so it's the same on every device.

- Set up once at **`sync.html`** (☁️ button bottom-right on every page): create the private repo + a fine-grained token (Contents: Read & write on that repo only), paste it, click Connect.
- Other devices: use **"Copy setup link"** on the Sync page and open it once on the new device.
- Works offline; changes sync when back online. Histories from different devices are merged, never overwritten.
- Engine: `assets/sync.js`. It syncs the localStorage keys listed in its `CFG.keys` (add new apps' keys there).
- Your Anthropic API key (optional Claude grading) is never stored in this public repo; it only syncs to the private data repo if you tick that option.
