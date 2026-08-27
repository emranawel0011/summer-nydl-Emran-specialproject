const mongoose = require('mongoose');

// Same shape the frontend has always received from GET /api/books — only the
// storage moved from data/books.json to MongoDB. `id` is a plain number (not
// Mongo's ObjectId) so the client's existing `?id=<n>` links keep working.
const bookSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true },
    title: { type: String, required: true },
    author: { type: String, required: true },
    genre: { type: String, required: true },
    year: Number,
    rating: Number,
    price: Number,
    pages: Number,
    language: String,
    cover: String,
    description: String
  },
  { versionKey: false }
);

module.exports = mongoose.models.Book || mongoose.model('Book', bookSchema);
