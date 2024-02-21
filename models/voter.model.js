const mongoose = require('mongoose');

const voterSchema = new mongoose.Schema({
  user: { type: String, required: true },
  votes: { type: Array, default: [] },
});

module.exports = mongoose.model('Voter', voterSchema);
