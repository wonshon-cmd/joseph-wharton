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
          progressTotals: { mc: 88, sa: 30 },
          progressKey2: "mktg6110_prep_v1",         // study guide app (MC quiz / essays / drills)
          items: [
            { icon: "🎯", title: "Practice & Records", href: "practice/", desc: "10 exam topics, 88 MC + 30 short answers with instant grading (and optional Claude grading). Every answer syncs online to all your devices, with your full history on My Records.", primary: true },
            { icon: "📘", title: "Full Study Guide", href: "study-guide/", desc: "Visual summary of every lecture, 166 MC, 32 essays, math drills, mock exam, weak spots, glossary, company examples." },
            { icon: "📄", title: "MAX Cheat Sheet", href: "cheat-sheets/max.html", desc: "Current version: 2 pages, all topics + graphics + abbreviation key.", extra: [{ label: "PDF", href: "cheat-sheets/max.pdf" }] },
            { icon: "📝", title: "Cheat Sheet (with space)", href: "cheat-sheets/with-space.html", desc: "Earlier version with company examples and room for handwritten notes.", extra: [{ label: "PDF", href: "cheat-sheets/with-space.pdf" }] },
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
        }
        // , { code: "XXXX 0000", slug: "xxxx-0000", title: "Next course", prof: "", color: "#2a78d6", items: [] }
      ]
    }
    // , { id: "term-4", name: "Term 4", when: "", courses: [] }
  ]
};
