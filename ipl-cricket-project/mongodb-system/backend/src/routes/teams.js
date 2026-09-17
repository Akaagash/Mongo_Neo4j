const express = require('express');
const Team = require('../models/team');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const teams = await Team.find().sort({ name: 1 }).lean();
    res.json({ success: true, count: teams.length, data: teams });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;