# BookNest 📚

A small book-browsing website built with **plain HTML, CSS and JavaScript** —
no frameworks — talking to a tiny **Node.js API**.

The project has two halves:

| Folder | What it is | Do you touch it? |
| --- | --- | --- |
| `backend/` | The API. Serves book data as JSON. | **No.** Just run it. |
| `frontend/` | The website. HTML, CSS, JS. | **Yes.** This is where you work. |

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
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-host>/books?retryWrites=true&w=majority
```

Note the `/books` right before the `?` — that's the database name. BookNest and
QuizQuest share the same Atlas cluster but keep their data in separate
databases (`books` and `quizes`), so nothing collides. `.env` is gitignored —
never commit it.

### Step 2 — start the backend, and leave it running

```bash
npm install     # only needed the first time
npm start
```

You should see:

```
  📚 BookNest API is running
     http://localhost:4001
```

The first boot seeds the `books` database with the starter catalogue if it's
empty — after that it's left alone, so you can edit books in Atlas by hand and
restarts won't stomp on the changes.

**Leave this terminal open.** If you close it, the API stops and the website
will show "Couldn't reach the server."

> Prefer auto-restart while editing the backend? Use `npm run dev` instead.
> It restarts only when you edit the source (`server.js`, `routes/`, `utils/`,
> `models/`).

### Step 3 — check the API is really up

Open <http://localhost:4001> in your browser. You should see:

```json
{ "status": "ok", "message": "BookNest API is running 📚", "docs": "/api/books" }
```

Then try <http://localhost:4001/api/books> — a big list of books in JSON.
If both of those work, the backend is fine and any problem is in the frontend.

### Step 4 — start the frontend

1. Open the **`frontend`** folder in VS Code.
2. Right-click `index.html` → **Open with Live Server** (or click **Go Live** in
   the bottom-right status bar).
3. Your browser opens at `http://127.0.0.1:5500` and the site loads.

> Don't open the HTML files by double-clicking them. Use Live Server — it gives
> the pages a real `http://` address, which is what the browser needs in order
> to let them call the API.

---

## The API (what the frontend talks to)

Base URL: `http://localhost:4001/api`

| Method | Endpoint | What it does |
| --- | --- | --- |
| `GET` | `/api/books` | All books. Add `?search=dune` or `?genre=Fiction` to narrow it down (they combine). |
| `GET` | `/api/books/:id` | One book, e.g. `/api/books/5`. Returns `404` if that id doesn't exist. |
| `GET` | `/api/genres` | The list of genres, for the filter dropdown. |
| `POST` | `/api/contact` | Send `{ name, email, message }`. Returns `201` on success. |

Try them straight in your browser's address bar — every `GET` above is just a URL.

Status codes you'll see: `200` OK, `201` created, `400` bad input, `404` not
found, `500` server error. Errors always look like `{ "error": "..." }`.

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

**`EADDRINUSE: address already in use :::4001`**
Something is already using port 4001 — almost certainly another copy of this
same server left running in another terminal. Stop that one first.

> BookNest is on **4001** and QuizQuest is on **4000**, so the two projects can
> happily run at the same time.

**The site says "Couldn't reach the server" even though the API works.**
If <http://localhost:4001/api/books> shows JSON in a browser tab but the page
still can't reach it, check the port number in `frontend/js/config.js` matches
the one the server printed. Also avoid "unsafe" ports such as 6000: browsers
refuse to connect to them, so the server answers `curl` fine while every
`fetch()` from a page fails. Stick to 3000–5000 or 8000–9000.

**I edited the frontend but nothing changed.**
Hard-refresh the page: `Ctrl` + `Shift` + `R`.

---

## Pointing at a different backend

The API address is written in **exactly one place**:

```js
// frontend/js/config.js
const API_BASE_URL = "http://localhost:4001/api";
```

Change that one line and the whole site talks to a different server. That's why
it lives in its own file — you never have to hunt for URLs scattered through the
code.

---

## Where the data actually lives

In **MongoDB Atlas**, in the `books` database (see `MONGODB_URI` in `.env`):

- `books` collection — the catalogue (seeded automatically on first run, if empty)
- `messages` collection — where contact-form submissions land

To get the original 16 books back, drop the `books` collection in Atlas (or run
`db.books.deleteMany({})` in the Mongo shell / Compass) and restart the server —
`seed()` will refill it.
