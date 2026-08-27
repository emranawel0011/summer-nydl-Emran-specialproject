const mongoose = require('mongoose');

// Leaderboard entries. `id` is a plain number so the response shape matches
// what the client already expects from the old file-based store.
const scoreSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, default: '' },
    deviceId: { type: String, default: '' },
    score: { type: Number, required: true },
    total: { type: Number, required: true },
    category: { type: String, required: true },
    percent: { type: Number, required: true },
    playedAt: { type: Date, default: Date.now }
  },
  { versionKey: false }
);

module.exports = mongoose.models.Score || mongoose.model('Score', scoreSchema);
