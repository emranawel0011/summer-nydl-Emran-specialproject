const mongoose = require('mongoose');

// Contact-form submissions. Never read back by the client — write-only.
const messageSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    message: { type: String, required: true },
    receivedAt: { type: Date, default: Date.now }
  },
  { versionKey: false }
);

module.exports = mongoose.models.Message || mongoose.model('Message', messageSchema);
