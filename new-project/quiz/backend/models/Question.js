const mongoose = require('mongoose');

// Same shape the frontend has always received from GET /api/questions —
// only the storage moved from data/questions.json to MongoDB. `id` is a
// plain number (not Mongo's ObjectId), matching the seed data below.
//
// correctAnswer is included in the document on purpose — grading happens in
// the browser (see seed.js for why).
const questionSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true },
    category: { type: String, required: true },
    question: { type: String, required: true },
    options: { type: [String], required: true },
    correctAnswer: { type: String, required: true },
    difficulty: String
  },
  { versionKey: false }
);

module.exports = mongoose.models.Question || mongoose.model('Question', questionSchema);
