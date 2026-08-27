/*
 * scores.routes.js — the leaderboard.
 *
 * Mounted in server.js as:  app.use('/api/scores', scoresRouter);
 *   GET  /api/scores   read the ranked list
 *   POST /api/scores   save a new result
 */

const express = require('express');
const Score = require('../models/Score');

const router = express.Router();

/** Read saved scores from MongoDB. Always an array. */
async function getScores() {
  return Score.find({}, '-_id -__v').lean();
}

/** Next id = biggest existing id + 1, same rule the old file store used. */
async function nextId() {
  const last = await Score.findOne().sort({ id: -1 }).select('id').lean();
  return last ? last.id + 1 : 1;
}

/*
 * GET /api/scores
 *   ?category=<name>  optional filter
 *   ?deviceId=<id>    optional filter — "just this player's scores"
 *   ?limit=<n>        optional cap (e.g. "top 10")
 *
 * Sorted highest score first; ties broken by percent, then by most recent.
 * Sorting here means the client can render the array exactly as it arrives.
 */
router.get('/', async (req, res) => {
  let scores = await getScores();

  const category = (req.query.category || '').toString().trim();
  if (category !== '') {
    const wanted = category.toLowerCase();
    scores = scores.filter((entry) => (entry.category || '').toLowerCase() === wanted);
  }

  // Each browser generates its own deviceId once and sends it with every
  // score, so this filter answers "show me only my own results".
  const deviceId = (req.query.deviceId || '').toString().trim();
  if (deviceId !== '') {
    scores = scores.filter((entry) => entry.deviceId === deviceId);
  }

  scores = scores.slice().sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (b.percent !== a.percent) return b.percent - a.percent;
    return new Date(b.playedAt) - new Date(a.playedAt);
  });

  const limit = Number(req.query.limit);
  if (!Number.isNaN(limit) && limit > 0) {
    scores = scores.slice(0, limit);
  }

  res.status(200).json(scores);
});

/*
 * POST /api/scores
 * Body: { name, score, total, category, email?, deviceId? }
 *   400 -> missing name, missing category, a score that makes no sense, or an
 *          email that was supplied but is not an email
 *   201 -> the created Score object (id, percent and playedAt added here)
 *
 * `email` and `deviceId` are OPTIONAL. The browser saves the player's name
 * and email once (in localStorage) and generates a random deviceId, then
 * sends all three with every score — which is how repeat visits from the same
 * browser end up attached to the same player.
 */
router.post('/', async (req, res) => {
  const body = req.body || {};

  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const category = typeof body.category === 'string' ? body.category.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const deviceId = typeof body.deviceId === 'string' ? body.deviceId.trim() : '';
  const score = Number(body.score);
  const total = Number(body.total);

  if (name === '') {
    return res.status(400).json({ error: 'name is required' });
  }

  // Only check the email when one was actually sent. Same simple rule as
  // the browser uses: it has to contain an "@".
  if (email !== '' && !email.includes('@')) {
    return res.status(400).json({ error: 'Please provide a valid email' });
  }

  const scoresAreNumbers = !Number.isNaN(score) && !Number.isNaN(total);
  if (!scoresAreNumbers || total <= 0 || score < 0 || score > total) {
    return res.status(400).json({ error: 'invalid score' });
  }

  if (category === '') {
    return res.status(400).json({ error: 'category is required' });
  }

  // percent is computed on the server so the leaderboard can always trust it.
  const entry = {
    id: await nextId(),
    name: name,
    email: email,          // "" when the player did not give one
    deviceId: deviceId,    // "" for the seeded sample scores
    score: score,
    total: total,
    category: category,
    percent: Math.round((score / total) * 100),
    playedAt: new Date().toISOString()
  };

  const created = await Score.create(entry);
  const { _id, __v, ...rest } = created.toObject();

  res.status(201).json(rest);
});

module.exports = router;
