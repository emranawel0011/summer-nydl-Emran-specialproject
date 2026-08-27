# QuizQuest 🧠

An interactive trivia game built with **plain HTML, CSS and JavaScript** —
no frameworks — talking to a tiny **Node.js API**.

The project has two halves:

| Folder | What it is | Do you touch it? |
| --- | --- | --- |
| `backend/` | The API. Serves questions, stores leaderboard scores. | **No.** Just run it. |
| `frontend/` | The game. HTML, CSS, JS. | **Yes.** This is where you work. |

---

## Running it (do these in order)

### Step 1 — set the database connection

The backend stores its data in **MongoDB Atlas**, not on disk. Copy the example
env file and fill in your own connection string:

```bash
cd backend
cp .env.example .env
```

`.env` needs one line:

```
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-host>/quizes?retryWrites=true&w=majority
```

Note the `/quizes` right before the `?` — that's the database name. QuizQuest
and BookNest share the same Atlas cluster but keep their data in separate
databases (`quizes` and `books`), so nothing collides. `.env` is gitignored —
never commit it.

### Step 2 — start the backend, and leave it running

```bash
npm install     # only needed the first time
npm start
```

You should see:

```
  🧠 QuizQuest API is running
     http://localhost:4000
```

The first boot seeds the `quizes` database with the starter question bank if
it's empty — after that it's left alone, so an instructor can add their own
questions and restarts won't undo it.

**Leave this terminal open.** If you close it, the API stops and the game will
show "Couldn't reach the server."

> Prefer auto-restart while editing the backend? Use `npm run dev` instead.

### Step 3 — check the API is really up

Open <http://localhost:4000> in your browser. You should see:

```json
{ "status": "ok", "message": "QuizQuest API is running 🧠", "docs": "/api/categories" }
```

Then try <http://localhost:4000/api/categories> — the four quiz categories with
their question counts. If those work, the backend is fine and any problem is in
the frontend.

### Step 4 — start the frontend

1. Open the **`frontend`** folder in VS Code.
2. Right-click `index.html` → **Open with Live Server** (or click **Go Live** in
   the bottom-right status bar).
3. Your browser opens at `http://127.0.0.1:5500` and the game loads.

> Don't open the HTML files by double-clicking them. Use Live Server — it gives
> the pages a real `http://` address, which is what the browser needs in order
> to let them call the API.

---

## How the game flows

```
index.html  →  quiz.html  →  results.html  →  leaderboard.html
 pick a       one question    score, percent    everyone's
 category      at a time       and rank          top scores
```

Each arrow carries a little bit of information in the **URL**, like
`quiz.html?category=Science` and `results.html?score=7&total=9&category=Science`.
That's how these pages share data without a framework — read them back with
`URLSearchParams`.

---

## Who's playing? (name + email, per browser)

The first time you open the home page, QuizQuest asks for your **name and
email**. It saves them in this browser using `localStorage`, so:

- you only type them once,
- every score you save afterwards is filed under that name, and
- the same laptop in a different browser (or a different laptop) counts as a
  different player — that is the point.

Each browser also generates a random `deviceId` the first time you sign in. It
travels with every score, so the API can answer "show me every result from this
device" — try `http://localhost:4000/api/scores?deviceId=<the id>`.

**"Not you? Switch player"** on the home page forgets the saved details and
shows the form again. Clearing your browser data does the same thing.

It is not a login. Anyone using this browser is treated as this player, which
is fine for a classroom and worth knowing.

The code lives in `frontend/js/player.js` — one small file that does nothing
but read, write and validate the saved player.

---

## Resetting the data

The leaderboard fills up fast in a classroom. These npm scripts run from the
**`backend`** folder and put things back:

```bash
npm run data:status       # how many questions and scores are on disk right now
npm run scores:clear      # empty the leaderboard completely
npm run scores:reset      # put the 5 sample scores back
npm run questions:reset   # rewrite the question bank from seed.js
npm run data:reset        # both of the above — a full factory reset
```

They are safe to run while `npm start` is going: the server reads MongoDB fresh
on every request, so the next page load shows the new data.

---

## The API (what the frontend talks to)

Base URL: `http://localhost:4000/api`

| Method | Endpoint | What it does |
| --- | --- | --- |
| `GET` | `/api/categories` | The categories, each with a question `count`. |
| `GET` | `/api/questions?category=Science` | That category's questions, shuffled. Add `&amount=5` to get fewer. `404` if the category doesn't exist. |
| `GET` | `/api/scores` | The leaderboard, highest score first. Optional `?category=`, `?deviceId=` and `?limit=`. |
| `POST` | `/api/scores` | Send `{ name, score, total, category }`, plus optional `email` and `deviceId`. Returns `201` and the saved entry. |

Try the `GET`s straight in your browser's address bar — they're just URLs.

Status codes you'll see: `200` OK, `201` created, `400` bad input, `404` unknown
category, `500` server error. Errors always look like `{ "error": "..." }`.

**One thing worth knowing:** each question arrives with its `correctAnswer`
included, and the browser decides whether you got it right. That's deliberate
for this course — and yes, it means you can see the answers in DevTools. Real
quiz apps grade on the server; you'll learn how later.

---

## Common problems

**"Couldn't reach the server. Is the backend running?"**
The backend isn't running, or you closed its terminal. Go back to Step 2.

**The backend crashes on startup with something about `MONGODB_URI`.**
`.env` is missing or empty. Go back to Step 1 — copy `.env.example` to `.env`
and fill in a real connection string.

**The backend hangs on startup and never prints "API is running."**
It's stuck trying to reach MongoDB. Double-check the connection string (typos
in the username/password are the usual cause), and in Atlas confirm your
current IP is allowed under Network Access.

**The page is blank / nothing loads.**
Open DevTools (`F12`) → **Console**. Read the red error. Then check the
**Network** tab to see whether the request went out and what came back.

**`EADDRINUSE: address already in use :::4000`**
Something is already using port 4000 — probably another copy of this server, or
the BookNest server. Stop that one first; only one can use port 4000 at a time.

**"Pick a category first"**
You opened `quiz.html` directly, with no `?category=` in the URL. Start from the
home page.

---

## Pointing at a different backend

The API address is written in **exactly one place**:

```js
// frontend/js/config.js
const API_BASE_URL = "http://localhost:4000/api";
```

Change that one line and the whole game talks to a different server.

---

## Where the data actually lives

In **MongoDB Atlas**, in the `quizes` database (see `MONGODB_URI` in `.env`):

- `questions` collection — the question bank (seeded automatically on first run, if empty)
- `scores` collection — the leaderboard

Use the reset scripts above to put the originals back, or drop a collection in
Atlas and restart the server — `seed()` will refill the question bank.

Your own name and email are **not** in there. They live in your browser's
`localStorage`, and only travel to the server attached to a score you chose to
save.
