const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    city: { type: String, required: true, trim: true },
    captain: { type: String, required: true, trim: true },
  },
  { timestamps: true, collection: 'ipl_list' },
);

module.exports = mongoose.model('Team', teamSchema);