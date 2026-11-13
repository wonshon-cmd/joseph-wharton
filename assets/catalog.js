// =====================================================================
//  JOSEPH WHARTON: the one file to edit when adding terms / courses.
//  Add a term: copy a { term... } block. Add a course: copy a { code... } block
//  and put its files in /term-N/course-folder/.
// =====================================================================
window.CATALOG = {
  owner: "Joseph Wharton",
  tagline: "My Wharton coursework, study tools, and records, all in one place.",
  terms: [
    {
      id: "term-3",
      name: "Term 3",
      when: "Fall 2026",
      courses: [
        {
          code: "MKTG 6110",
          slug: "mktg-6110",
          title: "Marketing Management",
          prof: "Prof. Barbara E. Kahn",
          color: "#d55181",
          status: "Final exam: Sat, Oct 31 (15 MC × 2 + 8 short answers × 9)",
          progressKey: "mktg6110_site_v1",          // localStorage key of the practice app (for progress on cards)
          progressTotals: { mc: 289, sa: 71 },
          progressKey2: "mktg6110_prep_v1",         // study guide app (MC quiz / essays / drills)
          items: [
            { icon: "🎯", title: "Practice & Records", href: "practice/", desc: "12 exam topics (incl. Price Sensitivity & Promotion) + Brian's bank + 🎯 Weak Spots: 289 MC + 71 short answers with instant grading (and optional Claude grading). Every answer syncs online to all your devices, with your full history on My Records.", primary: true },
            { icon: "🎯", title: "Weak Spots", href: "practice/#weak", desc: "Only the questions you got wrong, with what to review and plain-English explanations. Clears once you answer right twice in a row." },
            { icon: "🧑‍🎓", title: "Brian's Question Bank", href: "practice/#brian", desc: "174 questions made by Brian (141 MC + 33 short answers), fact-checked against the course; corrections marked ✎." },
            { icon: "📘", title: "Full Study Guide", href: "study-guide/", desc: "Visual summary of every lecture, 213 MC, 36 essays (incl. Promotion, WACC & beta), math drills, mock exam, weak spots, glossary, company examples." },
            { icon: "📄", title: "MAX Cheat Sheet", href: "cheat-sheets/max.html", desc: "Current version: 2 pages, covers every practice question incl. Promotion; red underlined = key essay ideas.", extra: [{ label: "PDF", href: "cheat-sheets/max.pdf" }] },
            { icon: "📝", title: "Cheat Sheet (with space)", href: "cheat-sheets/with-space.html", desc: "2 pages, larger font (7.6px): every practice question covered in compact bullets + company examples, a little room for notes.", extra: [{ label: "PDF", href: "cheat-sheets/with-space.pdf" }] },
            { icon: "🕹️", title: "Pivot or Perish: Team 4 Copilot", href: "https://wonshon-cmd.github.io/pivotorperishteam4/", desc: "Getchells strategy dashboard, competitors, build plan, and the team write-up board (separate site)." },
            { icon: "🪵", title: "BEWÖÖD Pricing Case", href: "https://wonshon-cmd.github.io/wonshon-cmd-bewood-digest/", desc: "Case digest and answers (separate site)." },
            { icon: "📚", title: "Deep Dive PDFs (for NotebookLM)", href: "pdfs/deep-dive-all-topics.pdf", desc: "All 10 topics in one PDF, plus one PDF per topic.", extra: [
              { label: "① Kahn Matrix", href: "pdfs/by-topic/MKTG6110_01_Kahn_Matrix.pdf" },
              { label: "② Segmentation", href: "pdfs/by-topic/MKTG6110_02_Segmentation.pdf" },
              { label: "③ Brand Architecture", href: "pdfs/by-topic/MKTG6110_03_Brand_Architecture.pdf" },
              { label: "④ Extensions & Luxury", href: "pdfs/by-topic/MKTG6110_04_Extensions_and_Luxury.pdf" },
              { label: "⑤ Subscription Perks", href: "pdfs/by-topic/MKTG6110_05_Subscription_Perks.pdf" },
              { label: "⑥ Mass vs Segments", href: "pdfs/by-topic/MKTG6110_06_Mass_vs_Segments.pdf" },
              { label: "⑦ Measuring Brands", href: "pdfs/by-topic/MKTG6110_07_Measuring_Brands.pdf" },
              { label: "⑧ Pricing Basics", href: "pdfs/by-topic/MKTG6110_08_Pricing_Basics.pdf" },
              { label: "⑨ Pricing Tactics", href: "pdfs/by-topic/MKTG6110_09_Pricing_Tactics.pdf" },
              { label: "⑩ Place & Channels", href: "pdfs/by-topic/MKTG6110_10_Place_and_Channels.pdf" }
            ] }
          ]
        },
        {
          code: "OIDD 6110",
          slug: "oidd-6110",
          title: "Operations Management: Quality & Productivity",
          prof: "Prof. Christian Terwiesch",
          color: "#0f7b6c",
          status: "HW1 Nov 20 · HW2 Dec 5 · HW3 Dec 10 · Final Sat Dec 12 (2 h, closed book, 1-page own cheat sheet)",
          progressKey: "oidd6110_learn_v1",
          progressTotals: { mc: 224 },
          items: [
            { icon: "📚", title: "Practice by Chapter", href: "learn/#practice/intro", desc: "One tab per module (INTRO, PROCESS, FLOW, LITTLE, MULTI, KPI, LEAN, WAIT, LOSS, QUALITY): every concept question, calculation question, 🎲 unlimited new-number problem and exam-style scenario for that chapter.", primary: true },
            { icon: "🎯", title: "Exam Practice (HW1 format)", href: "learn/#exam", desc: "Unlimited freshly generated mock exams that look like HW1 / the final: scenarios with numeric answers, 1 pt each, timed, graded on submit with full solutions. HW1-style half, second half, or full 2-hour final, plus drills for each question type.", primary: true, extra: [{ label: "🧠 Exam Playbook", href: "learn/#playbook" }] },
            { icon: "📄", title: "One-Page Cheat Sheet", href: "cheat-sheet/", desc: "Letter size, 1 page: every HW1 question type with its formula AND a worked example with real numbers (plus the second-half formulas). Model for the cheat sheet you write yourself for the exam.", extra: [{ label: "PDF", href: "cheat-sheet/cheat-sheet.pdf" }] },
            { icon: "📖", title: "Learn from Zero: 10 Modules", href: "learn/", desc: "Every module explained for a total beginner: pictures, the logic and the “why”, step-by-step worked examples, concept checks, calculation drills with unlimited 🎲 new numbers, traps and what the professor emphasized." },
            { icon: "📝", title: "HW1 Prep", href: "learn/#hw1", desc: "Skill map of HW1 (due Nov 20) + a full HW1-style practice test with different numbers. HW1 itself is never solved here (syllabus: no AI on homework)." },
            { icon: "📂", title: "Cases by Module", href: "learn/#cases", desc: "Capital One and the Picadilly Bank call center broken down module by module (with the slot-by-slot waiting-time and cost analysis), plus Subway and the mortgage exercise." },
            { icon: "🧮", title: "Calculators", href: "learn/#tools", desc: "Process (bottleneck, labor), waiting time, Little's Law & turns, build-up diagram, implied utilization, Erlang loss: play “what if” to build intuition." },
            { icon: "📐", title: "All Formulas", href: "learn/#formulas", desc: "Every formula with why it works, on one printable page. Use it to write your own one-page exam cheat sheet." },
            { icon: "🎯", title: "Weak Spots & Records", href: "learn/#weak", desc: "Questions you missed (with links back to the lesson) and your full answer history, synced to all devices.", extra: [{ label: "📊 Records", href: "learn/#records" }] }
          ]
        },
        {
          code: "STAT 6130",
          slug: "stat-6130",
          title: "Basic Business Statistics",
          prof: "Wharton School",
          color: "#177a87",
          status: "Credit Risk Project · Installment 1",
          items: [
            { icon: "📊", title: "Interactive Installment 1 Walkthrough", href: "index.html", desc: "JMP steps, regression and PRSM concepts, residual checks, risk diversification, FICO predictions, and interactive graphs.", primary: true }
          ]
        },
        // , { code: "XXXX 0000", slug: "xxxx-0000", title: "Next course", prof: "", color: "#2a78d6", items: [] }
      ]
    }
    // , { id: "term-4", name: "Term 4", when: "", courses: [] }
  ]
};
