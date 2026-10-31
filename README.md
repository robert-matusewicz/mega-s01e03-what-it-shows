# MEGA.dev S01E03 · what it shows

Support ticket #4471 merged 412 reports about dates as one issue. They are three. Counts follow the desk's own view as exported: a report is counted under the cause it is filed by.

| problem | reports | ticket | desk outcome (5 Oct) |
|---|---|---|---|
| shared parser reads dates month first | 379 (5 of them read as a one-day move, counted here by tenant) | [#1](https://github.com/robert-matusewicz/mega-s01e03-what-it-shows/issues/1) | fixed: `fix(dates): parse dd/mm for eu locales` |
| booking-v3 form hint says MM/DD/YYYY | 33 | [#2](https://github.com/robert-matusewicz/mega-s01e03-what-it-shows/issues/2) | won't fix: booking-v3 form retired |
| invite date moves by one day | 5 (the five footnoted above) | [#3](https://github.com/robert-matusewicz/mega-s01e03-what-it-shows/issues/3) | not addressed; #4471 closed with these counted under the parser fix |

The page about them, signed:

- source: [`src/routes/kb/incidents/4471-three-problems/+page.svx`](src/routes/kb/incidents/4471-three-problems/+page.svx)
- as the desk will see it: [`rendered/kb/incidents/4471-three-problems.html`](rendered/kb/incidents/4471-three-problems.html) (the whole built kb is under `rendered/`)
- the logic it runs: [`src/lib/kb/problems.ts`](src/lib/kb/problems.ts), the table: [`src/lib/kb/ProblemTable.svelte`](src/lib/kb/ProblemTable.svelte)

The rest of this repo is the support desk's kb export (`support-kb/src` → `src/`), wrapped in a SvelteKit + mdsvex build so the pages render. The export itself is unchanged. To build: `npm install && npm run build`, then `npm run preview` and open `/kb`.

---

# kb — the support knowledge base

**kb** = knowledge base. What the support desk knows about how our products break, written
down where the code can keep it honest.

One desk takes reports for every product we run: `sched-prod` (calendar invites for about
300k people) and the rest. When something
goes wrong, the reports reach the desk first. This kb is how the desk triages them, what each
incident turned out to be, and why we decided what we decided.

## What's here

```
src/routes/kb/      the pages (.svx: Markdown with components)
  triage/           how the desk handles incoming reports
  incidents/        one page per big ticket
  decisions/        numbered decision records
src/lib/kb/         components and the logic they run
src/lib/layouts/    the frame every page shares
src/lib/data/       exports from the ticket system
```

## Conventions

- Words in the page, logic in `src/lib` (imported as `#lib/…`). A number that can be computed belongs in a component.
- Every page starts with frontmatter: `title`, `owner`, `status`, `reviewed`.
- A decision is never edited after it is accepted. A new record replaces it.
- A page you add is signed: its frontmatter carries your `signature` and it ends with `<RenderStamp {signature} />`, so the desk knows who wrote it.

## Owners

Support desk. Decision records: whoever signed them.

---

Exported 2026-10-04 from the `support` repo, `apps/kb/` → `src/`.
