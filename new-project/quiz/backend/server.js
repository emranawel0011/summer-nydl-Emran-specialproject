/* ==========================================================================
 * QuizQuest API
 *
 *   Students: you don't need to read or edit this file. Just run it.
 *
 *   1. npm install
 *   2. npm start        (or npm run dev for auto-restart)
 *   3. Leave it running, then open the frontend with Live Server.
 *
 * Sanity check in your browser: http://localhost:4000
 * ========================================================================== */

require('dotenv').config();

const express = require('express');
const cors = require('cors');

const connectDB = require('./utils/db');
const { seed } = require('./seed');
const quizRouter = require('./routes/quiz.routes');
const scoresRouter = require('./routes/scores.routes');

const app = express();
const PORT = process.env.PORT || 4000;

// Allowed frontend origins — a comma-separated list, hardcoded here (not in
// .env) so it's versioned with the code. Includes Live Server's local
// origins plus the deployed frontend's GitHub Pages origin (BookNest and
// QuizQuest are both served from the same repo/origin, just different paths
// — new-project/book/frontend/ and new-project/quiz/frontend/ — so both
// backends allow the same origin here).
const ALLOWED_ORIGINS = 'http://127.0.0.1:5500,http://localhost:5500,https://ny-development.github.io'
  .split(',')
  .map((origin) => origin.trim());

app.use(
  cors({
    origin(origin, callback) {
      // No Origin header (curl, Postman, server-to-server) — allow it.
      if (!origin || ALLOWED_ORIGINS.includes(origin)) {
        return callback(null, true);
      }
      callback(new Error('Not allowed by CORS: ' + origin));
    }
  })
);

// Parse incoming JSON bodies (needed for POST /api/scores).
app.use(express.json());

// Make sure MongoDB is connected — and the question bank seeded — before any
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
app.get('/', (req, res) => {
  res.status(200).type('html').send(`<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>QuizQuest API</title>
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
    background: linear-gradient(160deg, #1f1147, #3d1f6e);
    color: #f4effb;
  }
  main {
    width: 100%;
    max-width: 30rem;
    padding: 2.5rem;
    border-radius: 1rem;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.12);
    box-shadow: 0 1rem 3rem rgba(0, 0, 0, 0.35);
    text-align: center;
    backdrop-filter: blur(6px);
  }
  h1 { margin: 0 0 0.25rem; font-size: 1.75rem; }
  p.tagline { margin: 0 0 1.5rem; color: #cbb9ea; }
  .status {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.3rem 0.8rem;
    border-radius: 999px;
    background: rgba(67, 160, 71, 0.2);
    color: #7be07f;
    font-size: 0.85rem;
    font-weight: 600;
    margin-bottom: 1.5rem;
  }
  .status::before { content: "●"; color: #43e04e; }
  ul { list-style: none; padding: 0; margin: 0; text-align: left; }
  li {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.6rem 0;
    border-top: 1px solid rgba(255, 255, 255, 0.12);
    font-size: 0.9rem;
  }
  li:first-child { border-top: none; }
  code {
    background: rgba(255, 255, 255, 0.1);
    padding: 0.15rem 0.4rem;
    border-radius: 0.3rem;
    font-size: 0.85rem;
    white-space: nowrap;
  }
</style>
</head>
<body>
  <main>
    <h1>🧠 QuizQuest API</h1>
    <p class="tagline">A tiny REST API for the QuizQuest teaching project.</p>
    <div class="status">Running</div>
    <ul>
      <li><span>Categories</span><code>GET /api/categories</code></li>
      <li><span>Questions</span><code>GET /api/questions</code></li>
      <li><span>Leaderboard</span><code>GET /api/scores</code></li>
      <li><span>Save score</span><code>POST /api/scores</code></li>
    </ul>
  </main>
</body>
</html>`);
});

// Order matters: the more specific /api/scores mount is registered first.
app.use('/api/scores', scoresRouter); // GET + POST /api/scores
app.use('/api', quizRouter); // /api/categories, /api/questions

// Anything else under /api is a genuine 404.
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Last-resort error handler — always answer with JSON, never an HTML page.
app.use((err, req, res, next) => {
  console.error('[error]', err);
  res.status(500).json({ error: 'Something went wrong' });
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
        console.log('');
        console.log('  🧠 QuizQuest API is running');
        console.log('     http://localhost:' + PORT);
        console.log('     http://localhost:' + PORT + '/api/categories');
        console.log('');
        console.log('  Keep this terminal open, then start Live Server for the frontend.');
        console.log('');
      });
    })
    .catch((err) => {
      console.error('[server] Failed to start:', err);
      process.exit(1);
    });
}
