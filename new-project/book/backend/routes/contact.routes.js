/*
 * contact.routes.js — POST /api/contact
 *
 * This endpoint exists purely so students get to practise a real POST request.
 * Messages are saved to the `messages` collection and never shown back to anyone.
 */

const express = require('express');
const Message = require('../models/Message');

const router = express.Router();

/** Next id = biggest existing id + 1, same rule the old file store used. */
async function nextId() {
  const last = await Message.findOne().sort({ id: -1 }).select('id').lean();
  return last ? last.id + 1 : 1;
}

/*
 * POST /api/contact
 * Body: { name, email, message }
 *   400 -> missing/empty field, or an email without an "@"
 *   201 -> { success: true, message: "Thanks! We got your message." }
 */
router.post('/', async (req, res) => {
  const body = req.body || {};

  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const message = typeof body.message === 'string' ? body.message.trim() : '';

  if (name === '' || email === '' || message === '') {
    return res.status(400).json({ error: 'name, email and message are required' });
  }

  // Deliberately simple validation so the rule is easy to explain in class.
  if (!email.includes('@')) {
    return res.status(400).json({ error: 'Please provide a valid email' });
  }

  await Message.create({
    id: await nextId(),
    name: name,
    email: email,
    message: message,
    receivedAt: new Date().toISOString()
  });

  res.status(201).json({ success: true, message: 'Thanks! We got your message.' });
});

module.exports = router;
