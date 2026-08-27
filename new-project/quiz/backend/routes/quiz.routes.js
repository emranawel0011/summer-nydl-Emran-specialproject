/*
 * quiz.routes.js — the question bank.
 *
 * Mounted in server.js as:  app.use('/api', quizRouter);
 * so the public paths are /api/categories and /api/questions.
 */

const express = require('express');
const Question = require('../models/Question');

const router = express.Router();

// The order we want the Home picker to show them in (ARCHITECTURE section 5).
const CATEGORY_ORDER = ['General Knowledge', 'Science', 'History', 'Sport'];

/** Read the question bank from MongoDB. Always an array. */
async function getQuestions() {
  return Question.find({}, '-_id -__v').lean();
}

/**
 * Fisher-Yates shuffle: walk the array backwards and swap each item with a
 * random earlier one. Done on a copy so we never reorder the stored data.
 * Shuffling here (not in the browser) means a replay of the same category
 * asks the questions in a different order.
 */
function shuffle(items) {
  const copy = items.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = copy[i];
    copy[i] = copy[j];
    copy[j] = temp;
  }
  return copy;
}

/*
 * GET /api/categories
 * -> [{ name: "Science", count: 9 }, ...]  so the UI can show "9 questions".
 */
router.get('/categories', async (req, res) => {
  const questions = await getQuestions();

  // Count questions per category name.
  const counts = {};
  for (const question of questions) {
    const name = question.category;
    if (!name) continue;
    counts[name] = (counts[name] || 0) + 1;
  }

  // Known categories first in our fixed order, then any extras someone added.
  const names = Object.keys(counts);
  const known = CATEGORY_ORDER.filter((name) => names.includes(name));
  const extra = names.filter((name) => !CATEGORY_ORDER.includes(name));

  const categories = known.concat(extra).map((name) => ({ name: name, count: counts[name] }));

  res.status(200).json(categories);
});

/*
 * GET /api/questions
 *   ?category=<name>  filter to one category (404 if it has no questions)
 *   ?amount=<n>       cap how many come back (default: all of them)
 *
 * Reminder: the response includes `correctAnswer`. That is on purpose — the
 * browser grades the quiz, because server-side checking is a topic for a later
 * course.
 */
router.get('/questions', async (req, res) => {
  let questions = await getQuestions();

  const category = (req.query.category || '').toString().trim();

  if (category !== '') {
    // Compare case-insensitively so ?category=science still works.
    const wanted = category.toLowerCase();
    questions = questions.filter((question) => (question.category || '').toLowerCase() === wanted);

    // A category that matches nothing is a genuine 404 here (unlike a search,
    // which would just return an empty list).
    if (questions.length === 0) {
      return res.status(404).json({ error: 'Unknown category' });
    }
  }

  questions = shuffle(questions);

  // ?amount= is optional. Ignore it unless it is a sensible positive number.
  const amount = Number(req.query.amount);
  if (!Number.isNaN(amount) && amount > 0) {
    questions = questions.slice(0, amount);
  }

  res.status(200).json(questions);
});

module.exports = router;
