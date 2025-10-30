const mongoose = require('mongoose');

const birthdaySchema = new mongoose.Schema({
  name: { type: String, required: true },
  date: { type: String, required: true },
  relation: { type: String },
  interests: [{ type: String }],
  email: { type: String },
  notified: { type: Boolean, default: false },
  giftSuggestions: { type: String } // ✅ added comma above and fixed placement
}, { timestamps: true });

module.exports = mongoose.model('Birthday', birthdaySchema);
