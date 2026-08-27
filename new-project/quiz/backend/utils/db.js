/*
 * db.js — connects to MongoDB Atlas via Mongoose.
 *
 * Caches the connection on `global` so repeated calls (e.g. one per serverless
 * invocation, since the platform's filesystem is read-only and can't hold a
 * long-running process the way `npm start` on a laptop does) reuse the same
 * connection instead of opening a new one every time.
 */

const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Missing MONGODB_URI environment variable. Copy .env.example to .env and fill it in.');
}

let cached = global._quizquestMongoose;
if (!cached) {
  cached = global._quizquestMongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI).then((mongooseInstance) => mongooseInstance);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

module.exports = connectDB;
