/*
 * scripts/data.js — housekeeping commands for the MongoDB-backed data.
 *
 * Run these from the /backend folder:
 *
 *   npm run scores:clear     empty the leaderboard completely
 *   npm run scores:reset     put the sample scores back
 *   npm run questions:reset  rewrite the question bank from seed.js
 *   npm run data:reset       both of the above — a full factory reset
 *
 * Safe to run while the server is up: every request reads straight from
 * MongoDB, so the next page load will show the new data.
 */

require('dotenv').config();

const mongoose = require('mongoose');
const connectDB = require('../utils/db');
const Question = require('../models/Question');
const Score = require('../models/Score');
const { SAMPLE_QUESTIONS, SAMPLE_SCORES } = require('../seed');

const command = process.argv[2];

async function clearScores() {
  await Score.deleteMany({});
  console.log('[data] Leaderboard cleared — scores collection is now empty.');
}

async function resetScores() {
  await Score.deleteMany({});
  if (SAMPLE_SCORES.length > 0) {
    await Score.insertMany(SAMPLE_SCORES);
  }
  console.log(`[data] Leaderboard reset — ${SAMPLE_SCORES.length} sample scores restored.`);
}

async function resetQuestions() {
  await Question.deleteMany({});
  await Question.insertMany(SAMPLE_QUESTIONS);
  console.log(`[data] Question bank reset — ${SAMPLE_QUESTIONS.length} questions restored.`);
}

async function showStatus() {
  const questionCount = await Question.countDocuments();
  const scoreCount = await Score.countDocuments();
  console.log(`[data] questions collection: ${questionCount} questions`);
  console.log(`[data] scores collection:    ${scoreCount} scores`);
}

async function main() {
  await connectDB();

  switch (command) {
    case 'scores:clear':
      await clearScores();
      break;

    case 'scores:reset':
      await resetScores();
      break;

    case 'questions:reset':
      await resetQuestions();
      break;

    case 'reset':
      await resetQuestions();
      await resetScores();
      break;

    case 'status':
      await showStatus();
      break;

    default:
      console.log('Usage: node scripts/data.js <scores:clear|scores:reset|questions:reset|reset|status>');
      console.log('Or use the npm scripts: npm run scores:clear, npm run scores:reset, npm run data:reset');
      process.exitCode = 1;
  }

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
