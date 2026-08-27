/* ==========================================================================
 * BookNest API
 *
 *   Students: you don't need to read or edit this file. Just run it.
 *
 *   1. npm install
 *   2. npm start        (or npm run dev for auto-restart)
 *   3. Leave it running, then open the frontend with Live Server.
 *
 * Sanity check in your browser: http://localhost:4001
 * ========================================================================== */

require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./utils/db");
const { seed } = require("./seed");
const books = require("./routes/books.routes");
const contactRouter = require("./routes/contact.routes");

const app = express();

/* The port this API listens on.
 *
 * BookNest uses 4001 rather than 4000 so it can run at the same time as the
 * QuizQuest API, which uses 4000.
 *
 * ⚠️ Careful which number you pick. Browsers refuse to connect to a list of
 * "unsafe" ports — 1, 7, 21, 22, 25, 79, 87, 110, 143, 445, 993, 995, 2049,
 * 6000 and others — because they belong to older protocols. A server on one
 * of those starts up perfectly and answers curl, but every fetch() from a web
 * page fails with ERR_UNSAFE_PORT / "Failed to fetch". Ports in the
 * 3000–5000 and 8000–9000 ranges are safe.
 *
 * If you change this, change API_BASE_URL in frontend/js/config.js to match.
 */
const PORT = process.env.PORT || 4001;

// Allowed frontend origins — a comma-separated list, hardcoded here (not in
// .env) so it's versioned with the code. Includes Live Server's local
// origins plus the deployed frontend's GitHub Pages origin (BookNest and
// QuizQuest are both served from the same repo/origin, just different paths
// — new-project/book/frontend/ and new-project/quiz/frontend/ — so both
// backends allow the same origin here).
const ALLOWED_ORIGINS = "http://127.0.0.1:5500,http://localhost:5500,https://ny-development.github.io"
  .split(",")
  .map((origin) => origin.trim());

app.use(
  cors({
    origin(origin, callback) {
      // No Origin header (curl, Postman, server-to-server) — allow it.
      if (!origin || ALLOWED_ORIGINS.includes(origin)) {
        return callback(null, true);
      }
      callback(new Error("Not allowed by CORS: " + origin));
    },
  }),
);

// Parse incoming JSON bodies (needed for POST /api/contact).
app.use(express.json());

// Make sure MongoDB is connected — and the catalogue seeded — before any
// request reaches a route. connectDB() caches its connection and this only
// seeds once, so after the first request this middleware is instant. This
// has to happen per-request (not just before app.listen(), below) because on
// a serverless platform app.listen() never runs at all — the platform calls
// the exported `app` directly as the request handler.
let seedPromise = null;
app.use((req, res, next) => {
  connectDB()
    .then(() => {
      if (!seedPromise) seedPromise = seed();
      return seedPromise;
    })
    .then(() => next())
    .catch((err) => {
      seedPromise = null; // let the next request try again
      next(err);
    });
});

// A small styled landing page, so opening the URL in a browser shows
// something more useful than raw JSON.
app.get("/", (req, res) => {
  res.status(200).type("html").send(`<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>BookNest API</title>
<style>
  :root { color-scheme: light dark; }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1.5rem;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    background: linear-gradient(160deg, #fdf6ec, #f1e4cf);
    color: #2c2417;
  }
  main {
    width: 100%;
    max-width: 30rem;
    padding: 2.5rem;
    border-radius: 1rem;
    background: #fffaf2;
    box-shadow: 0 1rem 3rem rgba(60, 40, 10, 0.15);
    text-align: center;
  }
  h1 { margin: 0 0 0.25rem; font-size: 1.75rem; }
  p.tagline { margin: 0 0 1.5rem; color: #7a6a4f; }
  .status {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.3rem 0.8rem;
    border-radius: 999px;
    background: #e4f2e1;
    color: #2f6d33;
    font-size: 0.85rem;
    font-weight: 600;
    margin-bottom: 1.5rem;
  }
  .status::before { content: "●"; color: #43a047; }
  ul { list-style: none; padding: 0; margin: 0; text-align: left; }
  li {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.6rem 0;
    border-top: 1px solid #eee0c8;
    font-size: 0.9rem;
  }
  li:first-child { border-top: none; }
  code {
    background: #f1e4cf;
    padding: 0.15rem 0.4rem;
    border-radius: 0.3rem;
    font-size: 0.85rem;
    white-space: nowrap;
  }
</style>
</head>
<body>
  <main>
    <h1>📚 BookNest API</h1>
    <p class="tagline">A tiny REST API for the BookNest teaching project.</p>
    <div class="status">Running</div>
    <ul>
      <li><span>All books</span><code>GET /api/books</code></li>
      <li><span>One book</span><code>GET /api/books/:id</code></li>
      <li><span>Genres</span><code>GET /api/genres</code></li>
      <li><span>Contact form</span><code>POST /api/contact</code></li>
    </ul>
  </main>
</body>
</html>`);
});

app.use("/api/books", books.router); // /api/books, /api/books/genres, /api/books/:id
app.use("/api/genres", books.genresRouter); // /api/genres  (the path the client uses)
app.use("/api/contact", contactRouter); // POST /api/contact

// Anything else under /api is a genuine 404.
app.use("/api", (req, res) => {
  res.status(404).json({ error: "Not found" });
});

// Last-resort error handler — always answer with JSON, never an HTML page.
app.use((err, req, res, next) => {
  console.error("[error]", err);
  res.status(500).json({ error: "Something went wrong" });
});

// Export the Express app itself. Serverless platforms `require()` this file
// and call the exported app as a plain (req, res) handler — they never run
// app.listen() below, so nothing here can depend on that happening.
module.exports = app;

// Local dev only (`npm start` / `npm run dev`): actually bind to a port.
// Only runs when this file is executed directly, not when it's required.
// Seeding happens in the middleware above, on the first request.
if (require.main === module) {
  connectDB()
    .then(() => {
      app.listen(PORT, () => {
        console.log("");
        console.log("  📚 BookNest API is running");
        console.log("     http://localhost:" + PORT);
        console.log("     http://localhost:" + PORT + "/api/books");
        console.log("");
        console.log(
          "  Keep this terminal open, then start Live Server for the frontend.",
        );
        console.log("");
      });
    })
    .catch((err) => {
      console.error("[server] Failed to start:", err);
      process.exit(1);
    });
}
