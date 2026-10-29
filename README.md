# Joseph Wharton

My Wharton coursework, study tools, and saved practice records, all in one website.

**Live site:** https://wonshon-cmd.github.io/joseph-wharton/

## Structure

```
index.html                      ← Joseph Wharton home (all terms + "jump back in" progress)
assets/
  catalog.js                    ← THE file to edit when adding terms / courses / links
  hub.css, hub.js               ← shared look + page rendering
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

## Your records

Practice answers, essays, and scores are saved in the browser (per device). Use **My Records → Download my progress** to back up or move them, and **Load progress file** on the other device. Optional Claude grading uses your own Anthropic API key, which is stored only in your browser and never in this repo.
