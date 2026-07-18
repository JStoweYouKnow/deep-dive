# Deep Dive

Deep Dive is a local-first research memory that turns searches and LLM chats into an explainable reading queue. This working MVP stores activity and feedback in the browser, derives recurring threads from imported or pasted signals, and queries Crossref for source-linked reading when the user asks it to.

## Product plan

### The user and the job

For curious knowledge workers who move between web searches and LLM conversations, the app's job is to notice sustained lines of inquiry and point to the next useful piece of reading before context evaporates.

### MVP scope (implemented as a prototype)

1. **Activity inbox** — accept pasted searches, chat excerpts, bookmarks, and notes, or import `.txt`, `.csv`, and `.json` exports.
2. **Topic map** — cluster signals around recurring ideas and reveal the source signals behind each thread.
3. **Reading queue** — query Crossref for source-linked work and rank it against the active threads.
4. **Feedback loop** — save or skip items; saved-topic overlap boosts future ranking and skipped items leave the queue.
5. **Privacy control** — keep raw activity on device by default; make every connector opt-in.

### Recommended build path

| Phase | Outcome | Technical choice |
| --- | --- | --- |
| 1. Foundation | local prototype, CSV/paste imports, explicit explanations | Next.js + TypeScript + IndexedDB |
| 2. Connect | browser extension and opt-in LLM export imports | Manifest V3 extension; encrypted sync optional |
| 3. Intelligence | topic extraction, de-duplication, relevance scoring | local embeddings where possible; server-side only with consent |
| 4. Sources | high-quality, source-linked reading recommendations | OpenAlex/Crossref/RSS plus publisher metadata |
| 5. Trust | controls, deletion, and evaluation | per-source permissions, export/delete, relevance feedback metrics |

### Data & privacy decisions

- Never capture browser or chat content silently; every source is connected or imported explicitly.
- Store raw text locally and derive a minimal topic index for recommendations.
- Show the exact activity that caused each recommendation. Let people delete any source or item.
- Do not use private content to train models. If cloud analysis is later enabled, ask per import and transmit the smallest necessary excerpt.

### Success criteria for a first private beta

- A user can add/import activity and receive three clearly explained recommendations in under a minute.
- At least 60% of saved items are opened or marked read within seven days.
- Every recommendation has an explanation and a reversible feedback action.

## Run the prototype

Open `index.html` in a browser, or serve this folder with any static server. No build step is required. Crossref is queried only when the user adds activity or chooses “Find new reading”; if unavailable, the app uses clearly labeled fallback sources.

## Research studio features

The current app includes a timeline, weekly briefing, source-evidence thread view, relationship map, thread notebooks, trail-grounded question answering, reading intents and filters, reflections, a quick-save flow, an optional Chrome extension, and Markdown export of a research story. All activity, notes, reading feedback, and reflections stay in browser storage.

## Built with Codex & GPT-5.6

Deep Dive was designed and built collaboratively with **Codex powered by GPT-5.6**. Codex was used as an end-to-end product development partner: translating the initial concept into an MVP plan, designing the local-first data model and recommendation flow, implementing the interface and browser extension, tightening the privacy onboarding, validating JavaScript and deployment configuration, and deploying the app to Vercel.

GPT-5.6 was especially useful for iterating across product, design, and implementation in one workflow. It helped turn broad ideas—such as “notice the topics I keep circling”—into concrete features including explainable threads, source-linked reading, feedback-aware ranking, and a field-notebook visual language. The shipped app does **not** send private activity to a model at runtime: its in-browser theme grouping is deterministic, and Crossref is queried only when a user explicitly asks for reading.

### Development workflow

1. Define the user problem, privacy principles, and success criteria.
2. Build a runnable local-first prototype with sample and imported activity.
3. Iterate on interaction design, accessibility, responsive styling, and error states.
4. Verify the static application and configuration, then deploy the production build.
5. Package the source in this repository so the work can be reviewed and extended.
