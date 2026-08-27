# NYDL Special Projects

Teaching projects for the **Web Development Foundations** course: absolute-beginner-friendly full-stack apps, each pairing a vanilla HTML/CSS/JS frontend with a small Express + MongoDB API.

**Live:** the [`index.html`](index.html) at the repo root is a landing page hosted via GitHub Pages, linking out to both projects below.

| Project | What it is | Docs |
| --- | --- | --- |
| 📚 [**BookNest**](new-project/book) | A book-browsing website — catalogue, search/filter, book details, contact form. | [`new-project/book/README.md`](new-project/book/README.md) |
| 🧠 [**QuizQuest**](new-project/quiz) | An interactive trivia game with categories, live scoring, and a leaderboard. | [`new-project/quiz/README.md`](new-project/quiz/README.md) |

Each project is self-contained — its own frontend, backend, dependencies, and README. Start with the linked README above for whichever project you're working on; this file covers what's shared between them.

---

## Shape of each project

```
new-project/<book|quiz>/
├── frontend/     # Plain HTML, CSS, JS — served with the Live Server extension
└── backend/      # Express + MongoDB API — the frontend's only dependency
```

- **Frontend:** no framework, no build step, no npm packages beyond one CDN `<script>` for axios on a single page. Open the folder in VS Code and click **Go Live**.
- **Backend:** Node.js + Express, with Mongoose talking to MongoDB Atlas. `npm install && npm start` and it's up.

## Hosting

**Frontends — GitHub Pages.** This repo is published as a single static site: the root [`index.html`](index.html) is the landing page, and each frontend is reachable at a path under it:

- BookNest → `new-project/book/frontend/`
- QuizQuest → `new-project/quiz/frontend/`

Because GitHub Pages serves the whole repository, there's a `.nojekyll` file at the root so GitHub publishes everything as-is instead of running it through Jekyll. Enable Pages from **Settings → Pages → Deploy from a branch → `main` / `/ (root)`** if it isn't already.

**Backends — Vercel.** Each `backend/` is deployed separately:

- BookNest API → `https://books-nydl-special.vercel.app/api`
- QuizQuest API → `https://quiz-nydl-special.vercel.app/api`

These URLs are already wired up in each frontend's `js/config.js` (`API_BASE_URL`), and each backend's `server.js` allows the GitHub Pages origin (`https://ny-development.github.io`) in its CORS `ALLOWED_ORIGINS` list. If either the GitHub org or the Vercel project names change, update both places.

## Data: MongoDB Atlas, one cluster, two databases

Both backends store their data in MongoDB Atlas rather than on disk (flat JSON files don't survive a read-only serverless filesystem). They share one Atlas cluster but keep their data fully separate by using different database names in each backend's own connection string:

| Backend | Database | Port (local) |
| --- | --- | --- |
| `new-project/book/backend` | `books` | `4001` |
| `new-project/quiz/backend` | `quizes` | `4000` |

Each backend reads its connection string from `MONGODB_URI` in its own `backend/.env` (gitignored — never committed). Copy `.env.example` to `.env` in each backend folder and fill in real Atlas credentials to get started; see the project-level READMEs for the exact steps.

## Deploying the backend elsewhere

Both backends are plain Express apps that export `app` (`module.exports = app`) so a serverless platform can call it directly as a request handler — they don't rely on `app.listen()` in production, only for local dev. Whatever platform you deploy to needs:

- `MONGODB_URI` set as an environment variable (the `/books` or `/quizes` database name lives in the connection string itself).
- The deployed frontend's origin added to the `ALLOWED_ORIGINS` list at the top of that backend's `server.js` (CORS origins are hardcoded there, comma-separated, on purpose — not read from `.env` — so the allow-list is versioned with the code).

## Conventions across both projects

- **No database or build tooling on the frontend.** Everything a student touches is plain HTML/CSS/JS, run via Live Server.
- **One config file per frontend.** `frontend/js/config.js` holds `API_BASE_URL` — the only line to change to point a frontend at a different backend.
- **Backends are a black box to students.** They're fully built, documented, and meant to just run — the learning happens in the frontend code.
- **`CLAUDE.md` / `ARCHITECTURE.md`** in each project folder are instructor/AI-assistant references (kept local, not committed) — read those first if you're extending a project's backend or frontend contract.

## Getting started locally

Pick a project and follow its README:

- [BookNest →](new-project/book/README.md)
- [QuizQuest →](new-project/quiz/README.md)

Both follow the same pattern: set up the backend's `.env`, `npm install && npm start` the backend, then open the frontend with Live Server.
